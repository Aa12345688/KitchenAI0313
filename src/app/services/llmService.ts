import { useInventoryStore } from "./inventoryStore";
import { getRecipeImage } from "./recipeImageLibrary";

export interface LLMRecipeRequest {
    ingredients: string[];
    preferences?: string;
    model?: string;
}

export interface LLMDetectionResponse {
    name: string;
    category: string;
    isSpoiled: boolean;
    confidence: number;
}

export interface LLMRecipe {
    id: string;
    name: string;
    image: string;
    time: string;
    difficulty: "easy" | "medium" | "hard";
    category: string;
    requiredIngredients: string[];
    description: string;
    matchScore: number;
    steps?: { title: string; description: string }[];
}

// 免費模型降級鏈：當主模型失敗時依序嘗試
const FREE_MODEL_CHAIN = [
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
];

class LLMService {
    private keyIndex = 0;

    private getModelFallbackChain(primaryModel: string): string[] {
        const chainIdx = FREE_MODEL_CHAIN.indexOf(primaryModel);
        if (chainIdx >= 0) return FREE_MODEL_CHAIN.slice(chainIdx);
        return [primaryModel, ...FREE_MODEL_CHAIN];
    }

    private getAvailableKeys(): string[] {
        const envKeys = (import.meta.env.VITE_LLM_API_KEYS || import.meta.env.VITE_LLM_API_KEY || "").split(",").filter(Boolean);
        const userKeys = useInventoryStore.getState().settings.customApiKeys || [];
        return Array.from(new Set([...envKeys, ...userKeys]));
    }

    private getNextKey(): string {
        const keys = this.getAvailableKeys();
        if (keys.length === 0) return "";
        const key = keys[this.keyIndex % keys.length];
        this.keyIndex++;
        return key;
    }

    /**
     * 生成食譜 - 自動模型降級
     */
    async generateRecipes(request: LLMRecipeRequest): Promise<LLMRecipe[]> {
        const { model: selectedModel } = useInventoryStore.getState().settings;
        const primaryModel = request.model || selectedModel || "gemini-1.5-flash-8b";
        const modelChain = this.getModelFallbackChain(primaryModel);
        const keys = this.getAvailableKeys();

        for (const model of modelChain) {
            const maxRetries = Math.max(1, keys.length);
            let modelFailed = false;

            for (let i = 0; i < maxRetries; i++) {
                const apiKey = this.getNextKey();
                if (!apiKey) break;

                try {
                    console.log(`[LLM] 嘗試模型: ${model} (Key ${i + 1}/${maxRetries})`);
                    return await this.fetchFromGemini(request, model, apiKey);
                } catch (error: any) {
                    console.warn(`[LLM] 失敗 (${model}, Key ${i + 1}):`, error.message);
                    if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("403") || error.message.includes("400")) {
                        if (i === maxRetries - 1) modelFailed = true;
                        continue;
                    }
                    modelFailed = true;
                    break;
                }
            }

            if (modelFailed) console.warn(`[LLM] 模型 ${model} 失敗，降級...`);
        }

        throw new Error("❌ 所有模型均已達限，請稍候再試或更換 API 金鑰。");
    }

    /**
     * 食材影像辨識 - 自動模型降級
     */
    async detectIngredients(imageBase64: string): Promise<LLMDetectionResponse[]> {
        const { model: selectedModel } = useInventoryStore.getState().settings;
        const primaryModel = selectedModel.includes("flash") ? selectedModel : "gemini-1.5-flash-8b";
        const modelChain = this.getModelFallbackChain(primaryModel);
        const keys = this.getAvailableKeys();

        const prompt = `Identify ingredients in this picture for a smart fridge app. 
        For each fruit, vegetable or meat, return its name, category (fruit, vegetable, meat, other), 
        and whether it looks spoiled (isSpoiled: true/false). 
        Return ONLY a JSON array of objects: [{"name": string, "category": string, "isSpoiled": boolean, "confidence": number}].
        Limit to the top 10 items.`;

        for (const model of modelChain) {
            const maxRetries = Math.max(1, keys.length);

            for (let i = 0; i < maxRetries; i++) {
                const apiKey = this.getNextKey();
                if (!apiKey) break;

                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                    console.log(`[Vision] 嘗試模型: ${model} (Key ${i+1})`);

                    const response = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{
                                parts: [
                                    { text: prompt },
                                    { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                                ]
                            }]
                        })
                    });

                    if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
                    const data = await response.json();
                    useInventoryStore.getState().recordApiUsage();

                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
                    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
                    const results = JSON.parse(cleanJson);

                    return results.map((r: any) => ({
                        name: r.name || "未知食材",
                        confidence: r.confidence || 0.9,
                        category: r.category === "fruit" ? "水果" : r.category === "vegetable" ? "蔬菜" : r.category === "meat" ? "肉類" : "其他",
                        isSpoiled: !!r.isSpoiled
                    }));
                } catch (error: any) {
                    console.warn(`[Vision] 失敗 (${model}):`, error.message);
                    if (error.message.includes("403") || error.message.includes("429") || error.message.includes("400")) continue;
                    break;
                }
            }
        }

        return [];
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
        Structure: {"id":"r1","name":"菜名","time":"20 MIN","difficulty":"easy","category":"mixed","requiredIngredients":["item"],"description":"描述","matchScore":85,"steps":[{"title":"步驟","description":"做法"}]}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
        const data = await response.json();
        useInventoryStore.getState().recordApiUsage();

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const recipes = JSON.parse(cleanJson);

        return (Array.isArray(recipes) ? recipes : []).map((r: any) => ({
            ...r,
            id: r.id || `recipe-${Date.now()}-${Math.random()}`,
            image: getRecipeImage(r.name || "", r.requiredIngredients || request.ingredients, r.category || "mixed"),
            difficulty: r.difficulty?.toLowerCase() || "medium",
            category: r.category || "mixed",
            requiredIngredients: r.requiredIngredients || request.ingredients,
            matchScore: r.matchScore || 85,
            steps: r.steps || []
        }));
    }
}

export const llmService = new LLMService();
