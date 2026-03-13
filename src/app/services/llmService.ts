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

const STABLE_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash-lite-preview-02-05", // 目前測試最穩定的 2.0 版本
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
     * 診斷測試 - 專門用來測試哪一組 Key 有問題
     */
    async testConnection(): Promise<{ success: boolean; message: string; model?: string }> {
        const keys = this.getAvailableKeys();
        if (keys.length === 0) return { success: false, message: "沒有發現任何 API 金鑰" };

        const testKey = keys[0]; // 測試第一組
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${testKey}`;
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
            });
            const data = await res.json();
            if (res.ok) return { success: true, message: "連線成功！", model: "gemini-1.5-flash" };
            return { success: false, message: `Google 回報錯誤 (${res.status}): ${data.error?.message || "未知原因"}` };
        } catch (e: any) {
            return { success: false, message: `網路連線異常: ${e.message}` };
        }
    }

    async generateRecipes(request: LLMRecipeRequest): Promise<LLMRecipe[]> {
        const keys = this.getAvailableKeys();
        if (keys.length === 0) throw new Error("尚未設定 API 金鑰");

        for (let k = 0; k < keys.length; k++) {
            const apiKey = this.getNextKey();
            for (const model of STABLE_MODELS) {
                try {
                    return await this.fetchFromGemini(request, model, apiKey);
                } catch (error: any) {
                    console.warn(`[LLM] 報錯 (${model}):`, error.message);
                    if (k === keys.length - 1 && model === STABLE_MODELS[STABLE_MODELS.length - 1]) throw error;
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
            for (const model of ["gemini-1.5-flash", "gemini-1.5-flash-8b"]) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
                    console.warn(`[Vision] Failed with ${model}:`, e.message);
                }
            }
        }
        return [];
    }

    private async fetchFromGemini(request: LLMRecipeRequest, model: string, apiKey: string): Promise<LLMRecipe[]> {
        const systemPrompt = `You are a cook. Based on: ${request.ingredients.join(", ")}, suggest 2 recipes in TRADITIONAL CHINESE. Return ONLY a JSON array.`;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
