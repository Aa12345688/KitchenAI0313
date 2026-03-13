import React, { memo } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface DetectionRowProps {
    item: any;
    onUpdate: (id: string, delta: number) => void;
    onRemove: (id: string) => void;
}

export const DetectionRow = memo(({ item, onUpdate, onRemove }: DetectionRowProps) => {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.01 }}
            className="bg-[var(--card)]/30 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/5 hover:border-[var(--primary)]/20 transition-all group"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--background)] border border-white/5 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white text-sm tracking-tight mb-1 uppercase truncate group-hover:text-[var(--primary)] transition-colors leading-tight">
                        {item.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-[var(--primary)]/50 uppercase tracking-widest">
                            已驗證節點
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-[var(--background)] rounded-full p-1 border border-white/10 shadow-inner">
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => onUpdate(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-[var(--primary)] hover:text-[var(--background)] rounded-full transition-all text-gray-500"
                        >
                            <Minus size={14} strokeWidth={3} />
                        </motion.button>
                        <span className="w-8 text-center font-black text-[var(--primary)] text-sm tabular-nums">
                            {item.quantity}
                        </span>
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => onUpdate(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-[var(--primary)] hover:text-[var(--background)] rounded-full transition-all text-gray-500"
                        >
                            <Plus size={14} strokeWidth={3} />
                        </motion.button>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRemove(item.id)}
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 border border-red-500/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                        <Trash2 size={16} strokeWidth={2.5} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
});
