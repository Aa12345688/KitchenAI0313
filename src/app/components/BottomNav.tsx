import { Camera, Sparkles, BookOpen, User, Package } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";

/**
 * BottomNav (底部導覽列組件) - 極致視覺優化版
 */
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Camera, label: "掃描", path: "/" },
    { icon: Package, label: "冰箱", path: "/inventory" },
    { icon: Sparkles, label: "AI食譜", path: "/recipes" },
    { icon: BookOpen, label: "紀錄", path: "/saved" },
    { icon: User, label: "我的", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[430px] px-6 pb-8 pt-2 pointer-events-none mb-2">
      <div className="glass-panel w-full mx-auto rounded-[2.5rem] p-1.5 flex justify-around items-center pointer-events-auto relative overflow-hidden ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.85 }}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-[1.8rem] transition-all duration-300 group z-10 ${
                isActive ? "text-[var(--primary)]" : "text-white/30 hover:text-white"
              }`}
            >
              <Icon 
                size={22} 
                strokeWidth={isActive ? 3 : 2} 
                className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_var(--primary)]' : ''}`} 
              />
              
              <span className={`text-[8px] font-black tracking-[0.2em] relative z-10 transition-all duration-300 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              }`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-white/5 rounded-[1.8rem] z-0 ring-1 ring-white/10" 
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}