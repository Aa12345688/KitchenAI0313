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

/**
 * 穩定模型對照表
 * 為了確保相容性，我們在 v1 端點使用標準名稱，在 v1beta 使用帶有版本的名稱
 */
const MODAL_CONFIGS = [
    { version: "v1", name: "gemini-1.5-flash" },
    { version: "v1", name: "gemini-1.5-flash-8b" },
    { version: "v1beta", name: "gemini-2.0-flash-lite-preview-02-05" },
    { version: "v1beta", name: "gemini-1.5-flash-latest" }
];

class LLMService {
    private keyIndex = 0;

    private getAvailableKeys(): string[] {
        const envKeys = (import.meta.env.VITE_LLM_API_KEY || "").split(",").map((k: string) => k.trim()).filter(Boolean);
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
     * 更新後的診斷工具 - 嘗試多重組合以確保連通
     */
    async testConnection(): Promise<{ success: boolean; message: string; model?: string }> {
        const keys = this.getAvailableKeys();
        if (keys.length === 0) return { success: false, message: "沒有發現任何 API 金鑰，請在設定中添加或檢查 .env" };

        const testKey = keys[0];
        // 嘗試最穩定的組合
        const testConfigs = [
            { v: "v1", m: "gemini-1.5-flash" },
            { v: "v1beta", m: "gemini-1.5-flash-latest" }
        ];

        let lastError = "";
        for (const config of testConfigs) {
            try {
                const url = `https://generativelanguage.googleapis.com/${config.v}/models/${config.m}:generateContent?key=${testKey}`;
                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] })
                });
                const data = await res.json();
                if (res.ok) return { success: true, message: `連線成功！(${config.v}/${config.m})`, model: config.m };
                lastError = data.error?.message || `狀態碼 ${res.status}`;
            } catch (e: any) {
                lastError = e.message;
            }
        }
        return { success: false, message: `診斷失敗: ${lastError}` };
    }

    async generateRecipes(request: LLMRecipeRequest): Promise<LLMRecipe[]> {
        const keys = this.getAvailableKeys();
        if (keys.length === 0) throw new Error("尚未設定 API 金鑰");

        for (let k = 0; k < keys.length; k++) {
            const apiKey = this.getNextKey();
            for (const config of MODAL_CONFIGS) {
                try {
                    return await this.fetchFromGemini(request, config.name, apiKey, config.version);
                } catch (error: any) {
                    console.warn(`[LLM] 報錯 (${config.name}):`, error.message);
                    if (k === keys.length - 1 && config === MODAL_CONFIGS[MODAL_CONFIGS.length - 1]) throw error;
                    continue;
                }
            }
        }
        throw new Error("API 調用失敗");
    }

    async detectIngredients(imageBase64: string): Promise<LLMDetectionResponse[]> {
        const keys = this.getAvailableKeys();
        const prompt = `Identify ingredients. Return ONLY JSON array: [{"name": string, "category": string, "isSpoiled": boolean, "confidence": number}].`;

        for (let k = 0; k < keys.length; k++) {
            const apiKey = this.getNextKey();
            const configs = [
                { v: "v1", m: "gemini-1.5-flash" },
                { v: "v1beta", m: "gemini-1.5-flash-latest" }
            ];

            for (const config of configs) {
                try {
                    const url = `https://generativelanguage.googleapis.com/${config.v}/models/${config.m}:generateContent?key=${apiKey}`;
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

                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.error?.message || response.status);
                    }
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
                    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
                    const results = JSON.parse(cleanJson);

                    return results.map((r: any) => ({
                        name: r.name || "未知食材",
                        confidence: r.confidence || 0.9,
                        category: r.category === "fruit" ? "水果" : r.category === "vegetable" ? "蔬菜" : r.category === "meat" ? "肉類" : "其他",
                        isSpoiled: !!r.isSpoiled
                    }));
                } catch (e: any) {
                    console.warn(`[Vision] Failed with ${config.m}:`, e.message);
                }
            }
        }
        return [];
    }

    private async fetchFromGemini(request: LLMRecipeRequest, model: string, apiKey: string, version: string = "v1"): Promise<LLMRecipe[]> {
        const systemPrompt = `You are a cook. Based on: ${request.ingredients.join(", ")}, suggest 2 recipes in TRADITIONAL CHINESE. Return ONLY a JSON array.`;
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || response.status);
        }
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const recipes = JSON.parse(cleanJson);

        return (Array.isArray(recipes) ? recipes : []).map((r: any) => ({
            ...r,
            id: r.id || `r-${Math.random()}`,
            image: getRecipeImage(r.name || "", r.requiredIngredients || [], r.category || "mixed"),
            matchScore: r.matchScore || 85,
            steps: r.steps || []
        }));
    }
}

export const llmService = new LLMService();
