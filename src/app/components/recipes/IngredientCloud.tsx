import { Plus } from "lucide-react";

interface IngredientCloudProps {
    items: any[];
    onAddMore: () => void;
}

export function IngredientCloud({ items, onAddMore }: IngredientCloudProps) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">現有食材庫</h3>
                <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-tighter">{items.length} 個項目</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {items.length > 0 ? (
                    items.map((ingredient, index) => (
                        <div
                            key={index}
                            className="group flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-[var(--primary)]/50 transition-all cursor-default shadow-lg"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-tight">{ingredient.name}</span>
                            <span className="text-[9px] font-bold text-[var(--primary)]/60">×{ingredient.quantity}</span>
                        </div>
                    ))
                ) : (
                    <div className="w-full py-6 text-center bg-white/5 rounded-2xl border-2 border-dashed border-white/5">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">無食材訊號</p>
                    </div>
                )}
                <button
                    onClick={onAddMore}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl hover:bg-[var(--primary)]/10 transition-all group"
                >
                    <Plus size={14} className="text-[var(--primary)] group-hover:rotate-90 transition-transform" />
                    <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">管理</span>
                </button>
            </div>
        </div>
    );
}
