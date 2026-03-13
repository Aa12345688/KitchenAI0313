import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { llmService } from "./llmService";
import { notificationService } from "./notificationService";

export interface ScannedItem {
    id: string;
    name: string;
    quantity: number;
    timestamp: number;
    category?: string;
    freshness?: number; // 0-10
    expiryDays?: number; // Days until expiry
    confidence?: number;
    isSpoiled?: boolean;
    box?: number[]; // [x1, y1, x2, y2]
    storageType?: "fridge" | "freezer";
}

export interface WasteRecord {
    date: string;
    amount: number;
    items?: string[];
}

interface InventoryState {
    scannedItems: ScannedItem[];
    recommendedRecipes: any[];
    tempDetections: ScannedItem[];
    selectedIds: string[];
    settings: {
        notifications: boolean;
        neuralOptimized: boolean;
        confidenceThreshold: number;
        model: string;
        customApiKeys: string[];
        darkMode: boolean;
        dietaryPreferences: string;
        creativeLevel: "low" | "medium" | "high";
        themeColor: "emerald" | "violet" | "amber" | "blue";
        backgroundType: "default" | "pure" | "midnight";
    };
    wasteHistory: WasteRecord[];
    savedRecipes: any[];
    apiUsage: {
        count: number;
        lastReset: string; // YYYY-MM-DD
    };

    // Actions
    addItem: (item: Partial<ScannedItem>, source?: "ai" | "manual") => void;
    updateQuantity: (id: string, delta: number) => void;
    updateItem: (id: string, updates: Partial<ScannedItem>) => void;
    removeItem: (id: string) => void;
    removeItems: (ids: string[]) => void;
    toggleSelection: (id: string) => void;
    generateRecipe: () => Promise<void>;
    saveRecipe: (recipe: any) => void;
    unsaveRecipe: (recipeId: string) => void;
    clearAll: () => void;
    setRecipes: (recipes: any[]) => void;
    clearTempDetections: () => void;
    updateSettings: (settings: Partial<InventoryState['settings']>) => void;
    checkNotifications: () => void;
    clearWasteHistory: () => void;
    removeWasteRecord: (date: string) => void;
    removeWasteItem: (date: string, itemName: string) => void;
    recordApiUsage: () => void;
}

export const useInventoryStore = create<InventoryState>()(
    persist(
        (set, get) => ({
            scannedItems: [],
            recommendedRecipes: [],
            tempDetections: [],
            selectedIds: [],
            settings: {
                notifications: true,
                neuralOptimized: true,
                confidenceThreshold: 0.25,
                model: "gemini-2.0-flash",
                customApiKeys: [],
                darkMode: true,
                dietaryPreferences: "",
                creativeLevel: "medium",
                themeColor: "emerald",
                backgroundType: "default"
            },
            wasteHistory: [],
            savedRecipes: [],
            apiUsage: {
                count: 0,
                lastReset: new Date().toISOString().split('T')[0]
            },

            addItem: (item, source = "ai") => {
                const now = Date.now();
                const uniqueId = item.id || `${now}-${Math.random().toString(36).substr(2, 9)}`;
                const defaultExpiryMapping: Record<string, number> = {
                    "肉類": 3,
                    "乳製品": 5,
                    "蔬菜": 5,
                    "水果": 7,
                    "飲料": 30,
                    "其他": 7
                };
                const defaultDays = defaultExpiryMapping[item.category || "其他"] || 7;

                const newItem: ScannedItem = {
                    id: uniqueId,
                    name: item.name || "未知食材",
                    quantity: item.quantity || 1,
                    timestamp: item.timestamp || now,
                    category: item.category || "其他",
                    storageType: item.storageType || "fridge",
                    expiryDays: item.expiryDays !== undefined ? item.expiryDays : defaultDays,
                    ...item
                };

                set((state) => {
                    const existingIdx = state.scannedItems.findIndex(i => 
                        i.name.toLowerCase() === newItem.name.toLowerCase() && 
                        i.isSpoiled === newItem.isSpoiled && 
                        i.storageType === newItem.storageType
                    );

                    let newScannedItems = [...state.scannedItems];
                    let targetId = uniqueId;

                    if (existingIdx !== -1) {
                        const existing = newScannedItems[existingIdx];
                        targetId = existing.id;
                        newScannedItems[existingIdx] = {
                            ...existing,
                            quantity: existing.quantity + newItem.quantity,
                            timestamp: now
                        };
                    } else {
                        newScannedItems.push(newItem);
                    }

                    // Temp detections logic (for AI source)
                    let newTempDetections = [...state.tempDetections];
                    if (source === "ai") {
                        const tempIdx = newTempDetections.findIndex(i => 
                            i.name.toLowerCase() === newItem.name.toLowerCase() && 
                            i.isSpoiled === newItem.isSpoiled && 
                            i.storageType === newItem.storageType
                        );
                        if (tempIdx !== -1) {
                            newTempDetections[tempIdx] = {
                                ...newTempDetections[tempIdx],
                                quantity: newTempDetections[tempIdx].quantity + newItem.quantity,
                                timestamp: now
                            };
                        } else {
                            newTempDetections.push(newItem);
                        }
                    }

                    // Auto-select if not spoiled
                    let newSelectedIds = [...state.selectedIds];
                    if (!newItem.isSpoiled && !newSelectedIds.includes(targetId)) {
                        newSelectedIds.push(targetId);
                    }

                    return {
                        scannedItems: newScannedItems,
                        tempDetections: newTempDetections,
                        selectedIds: newSelectedIds
                    };
                });
            },

            updateQuantity: (id, delta) => {
                const updater = (items: ScannedItem[]) =>
                    items.map(item =>
                        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
                    ).filter(item => item.quantity > 0);

                set((state) => ({
                    scannedItems: updater(state.scannedItems),
                    tempDetections: updater(state.tempDetections)
                }));
            },

            updateItem: (id, updates) => {
                set((state) => ({
                    scannedItems: state.scannedItems.map(item => item.id === id ? { ...item, ...updates } : item),
                    tempDetections: state.tempDetections.map(item => item.id === id ? { ...item, ...updates } : item)
                }));
            },

            removeItem: (id) => {
                const state = get();
                state.removeItems([id]);
            },

            removeItems: (ids) => {
                if (!ids || ids.length === 0) return;
                
                const state = get();
                const itemsToRemove = state.scannedItems.filter(i => ids.includes(i.id));
                const wasteItems = itemsToRemove.filter(item => {
                    const now = Date.now();
                    const daysPassed = Math.floor((now - (item.timestamp || now)) / (1000 * 60 * 60 * 24));
                    const expiryDays = item.expiryDays !== undefined ? item.expiryDays : 7;
                    return item.isSpoiled || (expiryDays - daysPassed) <= 0 || expiryDays <= 0;
                });

                if (wasteItems.length > 0) {
                    notificationService.send("📊 數據統計更新", `已將 ${wasteItems.length} 項食材計入浪費數據`);
                    
                    set((state) => {
                        const today = new Date();
                        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                        const newHistory = [...state.wasteHistory];
                        const existingIdx = newHistory.findIndex(h => h.date === dateStr);
                        
                        if (existingIdx !== -1) {
                            newHistory[existingIdx] = {
                                ...newHistory[existingIdx],
                                amount: (Number(newHistory[existingIdx].amount) || 0) + wasteItems.length,
                                items: Array.from(new Set([...(newHistory[existingIdx].items || []), ...wasteItems.map(w => w.name)]))
                            };
                        } else {
                            newHistory.push({
                                date: dateStr,
                                amount: wasteItems.length,
                                items: wasteItems.map(w => w.name)
                            });
                            newHistory.sort((a, b) => a.date.localeCompare(b.date));
                        }
                        return { wasteHistory: newHistory };
                    });
                }

                set((state) => ({
                    scannedItems: state.scannedItems.filter(item => !ids.includes(item.id)),
                    tempDetections: state.tempDetections.filter(item => !ids.includes(item.id)),
                    selectedIds: state.selectedIds.filter(sid => !ids.includes(sid))
                }));
            },

            toggleSelection: (id) => {
                const item = get().scannedItems.find(i => i.id === id);
                if (item?.isSpoiled) return;
                set((state) => ({
                    selectedIds: state.selectedIds.includes(id)
                        ? state.selectedIds.filter(i => i !== id)
                        : [...state.selectedIds, id]
                }));
            },

            generateRecipe: async () => {
                const state = get();
                const selectedIngredients = state.scannedItems
                    .filter(item => state.selectedIds.includes(item.id) && !item.isSpoiled)
                    .map(item => item.name);

                if (selectedIngredients.length === 0) {
                    throw new Error("請選擇有效的食材進行合成（損壞食材將自動排除）");
                }

                const recipes = await llmService.generateRecipes({ 
                    ingredients: selectedIngredients,
                    preferences: state.settings.dietaryPreferences
                });
                set({ recommendedRecipes: recipes });
            },

            saveRecipe: (recipe) => {
                set((state) => {
                    if (state.savedRecipes.find(r => r.id === recipe.id)) return state;
                    return { savedRecipes: [...state.savedRecipes, recipe] };
                });
            },

            unsaveRecipe: (recipeId) => {
                set((state) => ({
                    savedRecipes: state.savedRecipes.filter(r => r.id !== recipeId)
                }));
            },

            clearAll: () => {
                localStorage.clear();
                set({
                    scannedItems: [],
                    recommendedRecipes: [],
                    tempDetections: [],
                    savedRecipes: [],
                    wasteHistory: [],
                    selectedIds: []
                });
                window.location.reload();
            },

            setRecipes: (recipes) => set({ recommendedRecipes: recipes }),
            clearTempDetections: () => set({ tempDetections: [] }),
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            checkNotifications: () => {
                const { settings, scannedItems } = get();
                if (settings.notifications && scannedItems.length > 0) {
                    notificationService.checkAndNotify(scannedItems, settings);
                }
            },

            clearWasteHistory: () => set({ wasteHistory: [] }),

            removeWasteRecord: (date) => set((state) => ({
                wasteHistory: state.wasteHistory.filter(h => h.date !== date)
            })),

            removeWasteItem: (date, itemName) => set((state) => ({
                wasteHistory: state.wasteHistory.map(h => {
                    if (h.date !== date) return h;
                    const newItems = (h.items || []).filter(name => name !== itemName);
                    return {
                        ...h,
                        amount: newItems.length,
                        items: newItems
                    };
                }).filter(h => h.amount > 0)
            })),

            recordApiUsage: () => {
                const today = new Date().toISOString().split('T')[0];
                set((state) => {
                    const isNewDay = state.apiUsage.lastReset !== today;
                    return {
                        apiUsage: {
                            count: isNewDay ? 1 : state.apiUsage.count + 1,
                            lastReset: today
                        }
                    };
                });
            }
        }),
        {
            name: 'kitchen-ai-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                scannedItems: state.scannedItems,
                recommendedRecipes: state.recommendedRecipes,
                settings: state.settings,
                savedRecipes: state.savedRecipes,
                wasteHistory: state.wasteHistory,
                apiUsage: state.apiUsage,
                tempDetections: state.tempDetections
            })
        }
    )
);
