import { useNavigate } from "react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ReactNode } from "react";
import { motion } from "framer-motion";

// --- PageHeader ---
interface PageHeaderProps {
    showBackButton?: boolean;
    title?: string;
    rightAction?: ReactNode;
}

export function PageHeader({ showBackButton = false, title = "KITCHEN AI", rightAction }: PageHeaderProps) {
    const navigate = useNavigate();

    return (
        <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between px-6 py-5 sticky top-0 bg-[var(--background)]/90 backdrop-blur-xl z-[100] border-b border-white/5"
        >
            <div className="flex items-center gap-2 min-w-[40px]">
                {showBackButton && (
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(-1)} 
                        className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                    >
                        <ArrowLeft size={22} />
                    </motion.button>
                )}
            </div>

            <h1 className="text-xs flex items-center gap-2 font-black tracking-[0.3em] text-white">
                <Sparkles size={16} className="text-[var(--primary)] animate-pulse" />
                {title.toUpperCase()}
            </h1>

            <div className="flex items-center gap-2 min-w-[40px] justify-end">
                {rightAction}
            </div>
        </motion.header>
    );
}

/**
 * Premium Button with Glow & Scale Effects
 */
export function SecondaryButton({ children, onClick, className = "" }: { children: ReactNode, onClick?: () => void, className?: string }) {
    return (
        <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all ${className}`}
        >
            {children}
        </motion.button>
    );
}

/**
 * Premium Card with Glassmorphism
 */
export function GlowCard({ children, className = "" }: { children: ReactNode, className?: string }) {
    return (
        <div className={`glass-panel rounded-[2.5rem] p-6 relative overflow-hidden group ${className}`}>
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-[80px] group-hover:bg-[var(--primary)]/5 transition-colors duration-700 pointer-events-none" />
             {children}
        </div>
    );
}
