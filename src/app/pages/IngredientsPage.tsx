import { useNavigate } from "react-router";
import { Trash2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, GlowCard } from "../components/Shared";
import { useIngredients } from "../services/IngredientContext";
import { DetectionRow } from "../components/inventory_management/DetectionRow";

export function IngredientsPage() {
    const navigate = useNavigate();
    const { scannedItems, updateQuantity, removeItem, clearAll } = useIngredients();

    return (
        <div className="pb-32">
            <PageHeader 
                showBackButton 
                title="最近辨識" 
                rightAction={
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            if (window.confirm("確定要清空所有掃描紀錄嗎？")) {
                                clearAll();
                            }
                        }}
                        className="p-2 sm:p-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-2xl border border-red-500/10 text-red-500"
                    >
                        <Trash2 size={20} className="stroke-[2.5]" />
                    </motion.button>
                } 
            />
            <div className="px-6 py-6">
                <h2 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-6 px-1 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[var(--primary)]" />
                    掃描紀錄
                </h2>
                
                <AnimatePresence mode="popLayout">
                    {scannedItems.length === 0 ? (
                        <GlowCard className="flex flex-col items-center justify-center py-24 text-center bg-white/5 rounded-[3.5rem] border border-white/5">
                            <div className="relative mb-8 group">
                                <div className="absolute inset-0 bg-[var(--primary)]/5 rounded-full blur-3xl opacity-20" />
                                <div className="relative w-24 h-24 bg-[var(--card)]/50 rounded-[2rem] border border-white/10 flex items-center justify-center shadow-2xl">
                                    <Plus size={40} className="text-[var(--primary)]/20" />
                                </div>
                            </div>
                            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 px-4">AI 感測器暫無攔截紀錄</h3>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/")} 
                                className="flex items-center gap-3 bg-[var(--primary)] text-[var(--background)] px-10 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl"
                            >
                                啟動視覺核心
                            </motion.button>
                        </GlowCard>
                    ) : (
                        <motion.div className="space-y-3">
                            {scannedItems.slice(0, 10).map((item) => (
                                <DetectionRow key={item.id} item={item} onUpdate={updateQuantity} onRemove={removeItem} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
