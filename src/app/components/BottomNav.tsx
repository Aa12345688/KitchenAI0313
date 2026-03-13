import { Camera, Sparkles, BookOpen, User, Package } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";

/**
 * BottomNav (底部導覽列組件)
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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[430px] px-4 pb-6 pt-2 pointer-events-none">
      <div className="w-full mx-auto bg-[var(--background)]/90 border border-white/10 rounded-[2.5rem] p-2 flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto relative overflow-hidden">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl transition-colors duration-200 group z-10 ${
                isActive ? "text-[var(--primary)]" : "text-gray-500 hover:text-white"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 4 : 2} className="relative z-10" />
              <span className={`text-[8px] font-black tracking-[0.2em] relative z-10 transition-all ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 group-hover:opacity-40"
              }`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="nav-glow"
                  transition={{ type: "tween", duration: 0.2 }}
                  className="absolute inset-x-0 inset-y-0 bg-[var(--primary)]/5 rounded-2xl z-0" 
                />
              )}
              
              {isActive && (
                <motion.div 
                  layoutId="dot"
                  transition={{ type: "tween", duration: 0.15 }}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--primary)] rounded-full shadow-[0_0_8px_var(--primary)]" 
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}