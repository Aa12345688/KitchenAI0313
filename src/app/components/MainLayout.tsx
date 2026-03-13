import { Outlet, useLocation, useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { useIngredients } from "../services/IngredientContext";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

/**
 * 主佈局組件 (Main Layout)
 * 這是整個應用的核心外框，所有分頁(Outlet)都會在這個佈局內被渲染。
 */
export function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { settings } = useIngredients();

    const tabs = ["/", "/inventory", "/recipes", "/saved", "/profile"];
    const currentIndex = tabs.findIndex(t => t === location.pathname || (t !== '/' && location.pathname.startsWith(t)));

    const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
        const threshold = 100;
        if (info.offset.x > threshold && currentIndex > 0) {
            navigate(tabs[currentIndex - 1]);
        } else if (info.offset.x < -threshold && currentIndex < tabs.length - 1 && currentIndex !== -1) {
            navigate(tabs[currentIndex + 1]);
        }
    };

    const [toast, setToast] = useState<{ title: string, body: string, type?: "warn" | "success" | "info" } | null>(null);

    useEffect(() => {
        const handleNotification = (e: any) => {
            setToast({
                title: e.detail.title,
                body: e.detail.body,
                type: e.detail.title.includes("✨") || e.detail.title.includes("成功") ? "success" :
                    e.detail.title.includes("⚠") || e.detail.title.includes("異常") ? "warn" : "info"
            });
            setTimeout(() => setToast(null), 5000);
        };
        window.addEventListener('app-notification', handleNotification);
        return () => window.removeEventListener('app-notification', handleNotification);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.themeColor);
        document.documentElement.setAttribute('data-background', settings.backgroundType);
    }, [settings.themeColor, settings.backgroundType]);

    return (
        <div className={`min-h-screen flex justify-center w-full transition-colors duration-500`}>
            {/* Global Background Grain Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[1000] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            <div className="w-full max-w-[430px] min-h-screen bg-black/60 backdrop-blur-2xl text-white relative flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border-x border-white/5">
                {/* Subtle Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none z-[900] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_4px] opacity-10" />

                <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.05}
                            onDragEnd={handleDragEnd}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{
                                type: "tween",
                                ease: "easeOut",
                                duration: 0.2
                            }}
                            className="touch-pan-y min-h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
                <BottomNav />

                {/* Cyberpunk Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px] z-[9999] pointer-events-none"
                        >
                            <div className={`glass-panel rounded-[2rem] p-5 flex items-start gap-4 border-l-4 ${toast.type === 'success' ? 'border-l-[var(--primary)] shadow-[0_10px_40px_-10px_rgba(0,255,136,0.3)]' :
                                toast.type === 'warn' ? 'border-l-red-500 shadow-[0_10px_40px_-10px_rgba(239,68,68,0.3)]' :
                                    'border-l-blue-500 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.3)]'
                                }`}>
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${toast.type === 'success' ? 'bg-[var(--primary)]/20 border-[var(--primary)]/50 text-[var(--primary)]' :
                                    toast.type === 'warn' ? 'bg-red-500/20 border-red-500/50 text-red-500' :
                                        'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                    }`}>
                                    <Bell size={20} className="animate-bounce" />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-black text-[10px] tracking-[0.2em] uppercase mb-1.5 ${toast.type === 'success' ? 'text-[var(--primary)]' :
                                        toast.type === 'warn' ? 'text-red-500' :
                                            'text-blue-400'
                                        }`}>
                                        {toast.title}
                                    </h4>
                                    <p className="text-sm text-white/90 font-medium leading-tight">
                                        {toast.body}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
