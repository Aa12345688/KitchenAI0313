/**
 * LLM 食譜生成服務 (LLM Recipe Generation Service - Direct Frontend Edition)
 * 
 * 本服務已改為純前端調用 Google Gemini API，無需安裝 Python 後端。
 * 支援 API Key 輪詢與動態模型切換。
 */
import { useInventoryStore } from "./inventoryStore";

export interface LLMRecipeRequest {
    ingredients: string[]; 
    preferences?: string; 
    model?: string;
}

export interface LLMDetectionResponse {
    name: string;
    confidence: number;
    category: string;
    isSpoiled: boolean;
    box?: number[];
}

export interface LLMRecipe {
    id: string;
    name: string;
    image: string;
    time: string;
    difficulty: "easy" | "medium" | "hard";
    category: "vegetable" | "fruit" | "meat" | "mixed";
    requiredIngredients: string[];
    description: string;
    matchScore: number;
    steps?: { title: string; description: string }[];
}

class LLMService {
    private keyIndex = 0;

    /**
     * 獲取目前可用的 API Keys (環境變數 + 使用者自定義)
     */
    private getAvailableKeys(): string[] {
        const envKeys = (import.meta.env.VITE_LLM_API_KEYS || import.meta.env.VITE_LLM_API_KEY || "").split(",").filter(Boolean);
        const userKeys = useInventoryStore.getState().settings.customApiKeys || [];
        return Array.from(new Set([...envKeys, ...userKeys]));
    }

    /**
     * 獲取下一個 API Key (輪詢機制)
     */
    private getNextKey(): string {
        const keys = this.getAvailableKeys();
        if (keys.length === 0) return "";
        const key = keys[this.keyIndex % keys.length];
        this.keyIndex++;
        return key;
    }

    /**
     * 調用生成食譜 (Generate Recipes)
     */
    async generateRecipes(request: LLMRecipeRequest): Promise<LLMRecipe[]> {
        const { model: selectedModel } = useInventoryStore.getState().settings;
        const model = request.model || selectedModel || "gemini-2.0-flash";
        
        const ingredients = request.ingredients;
        console.log(`[LLM] 使用模型: ${model}, 正在分析食材:`, ingredients);

        const keys = this.getAvailableKeys();
        const maxRetries = Math.max(1, keys.length);

        for (let i = 0; i < maxRetries; i++) {
            const apiKey = this.getNextKey();
            if (!apiKey) break;

            try {
                return await this.fetchFromGemini(request, model, apiKey);
            } catch (error: any) {
                console.warn(`[LLM] 嘗試失敗 (Key 輪詢中 ${i + 1}/${maxRetries}):`, error.message);
                if (error.message.includes("429") || error.message.includes("quota")) {
                    continue;
                }
                break;
            }
        }

        console.warn("[LLM] 所有 API Key 嘗試完畢或未設定 Key，切換保底模式。");
        return this.getOfflineFallback(ingredients);
    }

    /**
     * 使用 Gemini Vision 辨識食材 (Direct Vision Detection)
     */
    async detectIngredients(imageBase64: string): Promise<LLMDetectionResponse[]> {
        const { model: selectedModel } = useInventoryStore.getState().settings;
        const model = selectedModel.includes("flash") ? selectedModel : "gemini-1.5-flash"; // 確保使用支援 Vision 的模型
        const apiKey = this.getNextKey();

        if (!apiKey) {
            throw new Error("❌ 未偵測到 API 金鑰，請在設定或 .env 中配置。");
        }

        console.log(`[Vision] 使用模型: ${model}, 正在分析影像...`);

        const prompt = `Identify ingredients in this picture for a smart fridge app. 
        For each fruit, vegetable or meat, return its name, category (fruit, vegetable, meat, other), 
        and whether it looks spoiled (isSpoiled: true/false). 
        Return ONLY a JSON array of objects: [{"name": string, "category": string, "isSpoiled": boolean, "confidence": number}].
        Confidence should be 0.0 to 1.0. Limit to the top 10 items.`;

        try {
            const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
            const url = `${baseUrl}/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                        ]
                    }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });

            if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
            const data = await response.json();
            
            // 記錄成功調用
            useInventoryStore.getState().recordApiUsage();

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
            
            // 嘗試解析 JSON (處理可能存在的 Markdown code blocks)
            const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const results = JSON.parse(cleanJson);
            
            return results.map((r: any) => ({
                name: r.name || "未知食材",
                confidence: r.confidence || 0.9,
                category: r.category === "fruit" ? "水果" : r.category === "vegetable" ? "蔬菜" : r.category === "meat" ? "肉類" : "其他",
                isSpoiled: !!r.isSpoiled
            }));
        } catch (error) {
            console.error("[Vision] 辨識失敗:", error);
            throw error;
        }
    }

    private async fetchFromGemini(request: LLMRecipeRequest, model: string, apiKey: string): Promise<LLMRecipe[]> {
        const { creativeLevel } = useInventoryStore.getState().settings;
        const systemPrompt = `You are a practical home cook and nutritionist. 
        Focus on TRADITIONAL, FEASIBLE, and DAILY recipes. 
        Creativity level: ${creativeLevel === "high" || request.preferences?.includes("創意") ? "high" : "low"}.
        Based on these ingredients: ${request.ingredients.join(", ")}, 
        and dietary preferences: ${request.preferences || "None"},
        suggest 2 REALISTIC recipes that a normal person can cook at home.
        Return ONLY a JSON array of 2 recipe objects in TRADITIONAL CHINESE.
        Avoid weird combinations unless explicitly requested.
        Structure:
        {
            "id": "recipe-id",
            "name": "中文菜名",
            "image": "https://images.unsplash.com/photo-...",
            "time": "20 MIN",
            "difficulty": "easy|medium|hard",
            "category": "vegetable|fruit|meat|mixed",
            "requiredIngredients": ["item1", "item2"],
            "description": "吸引人的菜餚簡介（繁體中文）",
            "matchScore": 0-100,
            "steps": [{"title": "步驟標題", "description": "詳細做法"}]
        }`;

        const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
        const url = `${baseUrl}/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
        const data = await response.json();

        // 記錄成功調用
        useInventoryStore.getState().recordApiUsage();

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const recipes = JSON.parse(cleanJson);

        return recipes.map((r: any) => ({
            ...r,
            id: r.id || `recipe-${Date.now()}-${Math.random()}`,
            image: r.image || "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800",
            difficulty: r.difficulty?.toLowerCase() || "medium",
            category: r.category || "mixed",
            requiredIngredients: r.requiredIngredients || request.ingredients,
            matchScore: r.matchScore || 85,
            steps: r.steps || []
        }));
    }

    private getOfflineFallback(ingredients: string[]): LLMRecipe[] {
        const mainIng = ingredients[0] || "綜合食材";
        const templates = [
            {
                name: `${mainIng}風味炒飯`,
                description: `利用現有的 ${ingredients.slice(0, 2).join('與')} 快速翻炒出的香噴噴家常料理。`,
                category: "mixed" as const,
                image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=800"
            },
            {
                name: `家常${mainIng}燉煮`,
                description: `將 ${ingredients.join('、')} 燉煮，鎖住營養，口感豐富細膩的營養料理。`,
                category: "vegetable" as const,
                image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800"
            }
        ];

        return templates.map((t, idx) => ({
            id: `local-mock-${idx}-${Date.now()}`,
            name: t.name,
            image: t.image,
            time: `${15 + idx * 5} MIN`,
            difficulty: "easy",
            category: t.category,
            requiredIngredients: ingredients,
            description: t.description,
            matchScore: 90 - idx * 5,
            steps: [
                { title: "準備", description: `將 ${ingredients.join(", ")} 洗淨備用。` },
                { title: "烹飪", description: "在大火上快速加熱，並加入適量調味料。" },
                { title: "擺盤", description: "熱騰騰上桌享用。" }
            ]
        }));
    }
}

export const llmService = new LLMService();
