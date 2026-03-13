import { X } from "lucide-react";
import { useState } from "react";

interface AddEntryFormProps {
    onAdd: (item: { name: string; quantity: number; category: string }) => void; // 確認新增時要執行的 Callback
    onDismiss: () => void; // 點擊關閉或新增完成後，關閉表單的 Callback
    categories: string[]; // 允許使用者選擇的分類下拉選項
}

/**
 * 手動新增食材表單 (AddEntryForm)
 * 當 YOLO AI 無法正確辨識，或使用者想直接把菜市場剛買回來的整包內容輸入時使用。
 * 提供名稱欄位、數量調整器與分類下拉選單，介面採用懸浮卡片 (Card) 的設計，
 * 點擊 Confirm Registry 後會透過 `onAdd` 事件拋回給父層寫入 Context。
 */
export function AddEntryForm({ onAdd, onDismiss, categories }: AddEntryFormProps) {
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [category, setCategory] = useState("Other");

    // Smart Category Suggestion
    const suggestCategory = (itemName: string) => {
        const lowerName = itemName.toLowerCase();
        const mapping: Record<string, string[]> = {
            "水果": ["蘋果", "香蕉", "橘子", "葡萄", "草莓", "apple", "banana", "orange", "grape", "fruit"],
            "蔬菜": ["高麗菜", "菠菜", "花椰菜", "胡蘿蔔", "洋蔥", "cabbage", "spinach", "broccoli", "carrot", "onion", "veg"],
            "肉類": ["雞肉", "豬肉", "牛肉", "魚", "肉", "chicken", "pork", "beef", "fish", "meat"],
            "乳製品": ["牛奶", "起司", "優格", "奶", "milk", "cheese", "yogurt", "dairy"],
            "飲料": ["水", "可樂", "咖啡", "茶", "water", "cola", "coffee", "tea", "drink"]
        };

        for (const [cat, keywords] of Object.entries(mapping)) {
            if (keywords.some(k => lowerName.includes(k))) return cat;
        }
        return "其他";
    };

    const handleNameChange = (val: string) => {
        setName(val);
        const suggestion = suggestCategory(val);
        if (suggestion !== "其他") setCategory(suggestion);
    };

    const handleSubmit = () => {
        if (name.trim()) {
            onAdd({ name: name.trim(), quantity, category });
            setName("");
            setQuantity(1);
            onDismiss();
        }
    };

    return (
        <div className="px-6 py-4 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-[var(--card)] rounded-[2.5rem] p-8 border-2 border-[var(--primary)]/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <button onClick={onDismiss} className="text-white/20 hover:text-white/50"><X size={20} /></button>
                </div>
                <div className="flex items-center gap-3 mb-6">
                    <h3 className="font-black text-xs tracking-widest uppercase text-white/50">Add New Entry</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Item Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Avocado"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="w-full px-5 py-4 bg-[var(--background)] rounded-2xl border border-white/10 focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="w-full px-5 py-4 bg-[var(--background)] rounded-2xl border border-white/10 focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-5 py-4 bg-[var(--background)] rounded-2xl border border-white/10 focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold appearance-none shadow-inner"
                            >
                                {categories.filter(c => c !== "All").map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleSubmit}
                            className="w-full py-4 bg-[var(--primary)] text-[var(--background)] rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_10px_20px_rgba(0,255,136,0.3)] active:scale-95 transition-all"
                        >
                            Confirm Registry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
