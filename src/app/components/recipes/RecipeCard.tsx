import React, { memo } from "react";
import { Clock, TrendingUp, ChevronRight, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

interface RecipeCardProps {
    recipe: any;
    onClick: () => void;
    getCategoryLabel: (cat: string) => string;
}

/**
 * RecipeCard (食譜卡片) - 極致視覺優化版
 * 加入 Glassmorphism (磨砂玻璃) 效果與進階 Layered Animation
 */
export const RecipeCard = memo(({ recipe, onClick, getCategoryLabel }: RecipeCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className="group relative h-[420px] rounded-[3.5rem] overflow-hidden glass-panel transition-all duration-500 cursor-pointer mb-2"
        >
            {/* 背景圖片 */}
            <motion.div className="absolute inset-0 z-0">
                <motion.img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover opacity-50 group-hover:scale-110 group-hover:opacity-70 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </motion.div>

            {/* 頂部標註 */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
                <div className="flex flex-col gap-2.5">
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        className="bg-[var(--primary)] text-black text-[9px] font-black px-4 py-1.5 rounded-full shadow-[0_0_20px_var(--primary-glow)] uppercase tracking-widest"
                    >
                        AI 智能推薦
                    </motion.div>
                    <div className="bg-white/10 backdrop-blur-xl text-white/90 border border-white/20 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.1em] w-fit">
                        {getCategoryLabel(recipe.category)}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <motion.div 
                        className="bg-black/60 backdrop-blur-2xl rounded-2xl px-3 py-2 border border-white/10 flex flex-col items-center min-w-[60px] shadow-2xl"
                    >
                        <span className="text-[14px] font-black text-[var(--primary)]">{recipe.matchScore}%</span>
                        <span className="text-[7px] font-black text-white/40 uppercase tracking-tighter">匹配度</span>
                    </motion.div>
                    <button className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                        <Bookmark size={18} />
                    </button>
                </div>
            </div>

            {/* 底部內容區 */}
            <div className="absolute bottom-8 left-8 right-8 z-10">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)] animate-pulse" />
                    <span className="text-[10px] font-black text-[var(--primary)]/90 uppercase tracking-[0.2em]">Ready to cook</span>
                </div>

                <h3 className="font-black text-2xl text-white mb-4 uppercase tracking-tight group-hover:text-[var(--primary)] transition-colors leading-tight">
                    {recipe.name}
                </h3>

                <div className="flex items-center gap-6 mb-7 text-[10px] font-bold text-white/60 uppercase tracking-[0.15em]">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-[var(--primary)]" strokeWidth={3} />
                        <span>{recipe.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-[var(--primary)]" strokeWidth={3} />
                        <span>{recipe.difficulty}</span>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#00ff88', color: '#000' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white/5 backdrop-blur-xl text-white py-4.5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.3em] border border-white/10 shadow-xl flex items-center justify-center gap-3 transition-all duration-300"
                >
                    <span>開啟烹飪協議</span>
                    <ChevronRight size={18} strokeWidth={3} />
                </motion.button>
            </div>
            
            {/* 邊框發光特效 */}
            <div className="absolute inset-0 border border-white/5 rounded-[3.5rem] pointer-events-none group-hover:border-[var(--primary)]/20 transition-colors duration-700" />
        </motion.div>
    );
});
