import React from "react";
import { useNavigate } from "react-router";
import { 
    User, Settings, AlertTriangle, Sparkles, 
    HelpCircle, ChevronRight, LogOut, Cpu, Key, Plus, Trash2, Moon, UtensilsCrossed
} from "lucide-react";
import { PageHeader } from "../components/Shared";
import { useIngredients } from "../services/IngredientContext";
import { notificationService } from "../services/notificationService";

export function ProfilePage() {
    const { settings, updateSettings, clearAll, apiUsage } = useIngredients();
    const nav = useNavigate();
    const [newKey, setNewKey] = React.useState("");

    const addApiKey = () => {
        if (!newKey) return;
        const currentKeys = settings.customApiKeys || [];
        if (currentKeys.includes(newKey)) return setNewKey("");
        updateSettings({ customApiKeys: [...currentKeys, newKey] });
        setNewKey("");
    };

    const removeApiKey = (key: string) => {
        const currentKeys = settings.customApiKeys || [];
        updateSettings({ customApiKeys: currentKeys.filter(k => k !== key) });
    };

    const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash", "gpt-4o", "claude-3-5-sonnet-latest"];

    return (
        <div className="pb-24 px-6 py-8">
            <PageHeader title="個人設定" />
            
            <div className="flex flex-col items-center mb-10 mt-4">
                <div className="w-28 h-28 rounded-full bg-[var(--card)] border-4 border-[var(--primary)]/20 flex items-center justify-center shadow-2xl mb-6 relative">
                    <div className="absolute inset-0 bg-[var(--primary)]/5 rounded-full animate-pulse" />
                    <User size={48} className="text-[var(--primary)] relative z-10" strokeWidth={1} />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">使用者中心</h2>
                <div className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest opacity-60">已認證：首席美食品味家</div>
            </div>

            <div className="bg-[var(--card)]/20 p-6 rounded-[2.5rem] border border-white/5 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none" />
                
                <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-6 px-1 flex items-center gap-2">
                    <Settings size={12} /> 系統功能設定 (System Settings)
                </h3>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><AlertTriangle size={18} className="text-blue-400" /></div>
                            <div>
                                <div className="text-[10px] font-black text-white uppercase">食材過期提醒</div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase">智慧監測食材效期並發送通知</div>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                const newSetting = !settings.notifications;
                                if (newSetting) await notificationService.requestPermission();
                                updateSettings({ notifications: newSetting });
                            }}
                            className={`w-12 h-6 rounded-full relative transition-all duration-500 ${settings.notifications ? "bg-[var(--primary)]" : "bg-white/10"}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${settings.notifications ? "left-7" : "left-1"}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center"><Moon size={18} className="text-amber-400" /></div>
                            <div>
                                <div className="text-[10px] font-black text-white uppercase">深色模式 (Cyber Dark)</div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase">切換高對比賽博龐克主題</div>
                            </div>
                        </div>
                        <button
                            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings.darkMode ? "bg-amber-400" : "bg-white/10"}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${settings.darkMode ? "left-7" : "left-1"}`} />
                        </button>
                    </div>

                    {/* Theme Color Selector */}
                    <div className="pt-2 border-t border-white/5 mt-6 pt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center"><Plus size={18} className="text-[var(--primary)]" /></div>
                            <div>
                                <div className="text-[10px] font-black text-white uppercase">賽博主題配色 (Theme Color)</div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase">自定義環境 UI 核心色調</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-2 rounded-2xl">
                            {[
                                { id: 'emerald', color: '#00ff88', label: '翡翠' },
                                { id: 'violet', color: '#a855f7', label: '紫羅蘭' },
                                { id: 'amber', color: '#fbbf24', label: '琥珀' },
                                { id: 'blue', color: '#3b82f6', label: '湛藍' }
                            ].map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => updateSettings({ themeColor: t.id as any })}
                                    className={`relative w-12 h-12 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${settings.themeColor === t.id ? 'bg-white/10 scale-110 shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                                >
                                    <div className="w-5 h-5 rounded-full shadow-lg" style={{ backgroundColor: t.color }} />
                                    <span className="text-[7px] font-black text-white uppercase">{t.label}</span>
                                    {settings.themeColor === t.id && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-pulse" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Background Style Selector */}
                    <div className="pt-2 border-t border-white/5 mt-6 pt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><Moon size={18} className="text-gray-400" /></div>
                            <div>
                                <div className="text-[10px] font-black text-white uppercase">背景色調 (Background)</div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase">智慧環境底色切換</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'default', label: '預設主題', desc: 'Themed' },
                                { id: 'midnight', label: '深夜午夜', desc: 'Midnight' },
                                { id: 'pure', label: '曜石極黑', desc: 'Pure' }
                            ].map(b => (
                                <button 
                                    key={b.id}
                                    onClick={() => updateSettings({ backgroundType: b.id as any })}
                                    className={`py-3 px-2 rounded-2xl transition-all border ${settings.backgroundType === b.id ? 'bg-[var(--primary)]/10 border-[var(--primary)] shadow-lg' : 'bg-white/5 border-white/5 opacity-40 hover:opacity-100'}`}
                                >
                                    <div className="text-[10px] font-black text-white uppercase mb-0.5">{b.label}</div>
                                    <div className="text-[7px] font-bold text-gray-500 uppercase tracking-widest">{b.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 mt-6 pt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center"><Sparkles size={18} className="text-[var(--primary)]" /></div>
                            <div>
                                <div className="text-[10px] font-black text-white uppercase">AI 創意層級 (Creativity)</div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase">低：家常料理 | 高：米其林實驗料理</div>
                            </div>
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-2xl">
                            {(["low", "medium", "high"] as const).map(level => (
                                <button 
                                    key={level}
                                    onClick={() => updateSettings({ creativeLevel: level })}
                                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${settings.creativeLevel === level ? 'bg-[var(--primary)] text-[var(--background)]' : 'text-gray-500'}`}
                                >
                                    {level === "low" ? "傳統" : level === "medium" ? "均衡" : "創意"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 mt-6 pt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center"><UtensilsCrossed size={18} className="text-[var(--primary)]" /></div>
                            <div>
                                <div className="text-[10px] font-black text-white uppercase">個人飲食偏好 (Preferences)</div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase">AI 將優先按照此條件生成食譜</div>
                            </div>
                        </div>
                        <textarea 
                            value={settings.dietaryPreferences}
                            onChange={(e) => updateSettings({ dietaryPreferences: e.target.value })}
                            placeholder="例如：蛋奶素、不吃辣、高蛋白飲食、避開堅果..."
                            className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-[var(--primary)] resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <div className="text-[10px] font-black text-white uppercase">辨識靈敏度</div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase">調整視覺辨識的嚴謹門檻</div>
                            </div>
                            <div className="text-xs font-black text-[var(--primary)]">{Math.round(settings.confidenceThreshold * 100)}%</div>
                        </div>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="0.9" 
                            step="0.05" 
                            value={settings.confidenceThreshold} 
                            onChange={(e) => updateSettings({ confidenceThreshold: parseFloat(e.target.value) })}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                        />
                    </div>

                    <div className="pt-2 border-t border-white/5 mt-6 pt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center"><Cpu size={18} className="text-[var(--primary)]" /></div>
                            <div>
                                <div className="text-[10px] font-black text-white uppercase">AI 推理模型 (Neural Engine)</div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase">動態切換後端運算核心</div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {models.map(m => (
                                <button 
                                    key={m} 
                                    onClick={() => updateSettings({ model: m })}
                                    className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${settings.model === m ? 'bg-[var(--primary)] text-[var(--background)] border-[var(--primary)]' : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'}`}
                                >
                                    {m.replace("gemini-", "").replace("gpt-", "").replace("claude-", "")}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 mt-6 pt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center"><Key size={18} className="text-amber-400" /></div>
                            <div>
                                <div className="text-[10px] font-black text-white uppercase">自定義 API Keys (Rotation)</div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase">支援多組金鑰輪詢機制</div>
                            </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            {(settings.customApiKeys || []).map(k => (
                                <div key={k} className="flex items-center justify-between bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                    <span className="text-[10px] font-mono text-gray-400">••••••••{k.slice(-4)}</span>
                                    <button onClick={() => removeApiKey(k)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={12} /></button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input 
                                type="password" 
                                placeholder="輸入新的 API Key..." 
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold focus:outline-none focus:border-[var(--primary)]"
                            />
                            <button onClick={addApiKey} className="bg-[var(--primary)] text-[var(--background)] p-2 rounded-xl hover:scale-105 active:scale-95 transition-all"><Plus size={16} /></button>
                        </div>
                    </div>

                    {/* API Usage Quota Dashboard */}
                    <div className="pt-2 border-t border-white/5 mt-6 pt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"><Cpu size={18} className="text-green-400" /></div>
                            <div>
                                <div className="text-[10px] font-black text-white uppercase">API 額度監控 (Usage Quota)</div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase">今日已知成功調用次數與剩餘量</div>
                            </div>
                        </div>
                        
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="flex justify-between items-end mb-3">
                                <div className="text-2xl font-black text-white tracking-tighter">
                                    {Math.max(0, 1500 - (apiUsage?.count || 0))} <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest ml-1">次剩餘</span>
                                </div>
                                <div className="text-[8px] font-black text-gray-500 uppercase">今日已用: {apiUsage?.count || 0} / 1500</div>
                            </div>
                            
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[var(--primary)] transition-all duration-1000" 
                                    style={{ width: `${Math.min(100, ((apiUsage?.count || 0) / 1500) * 100)}%` }} 
                                />
                            </div>
                            
                            <div className="mt-3 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[7px] font-bold text-gray-500 uppercase tracking-[0.2em]">狀態：連線穩定 | 重置時間：{apiUsage?.lastReset} 00:00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[var(--card)]/20 p-6 rounded-[2.5rem] border border-white/5 mb-8">
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6 px-1">資料與權限管理</h3>
                <div className="space-y-4">
                    <button onClick={() => nav("/saved")} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center"><HelpCircle size={18} className="text-amber-400" /></div>
                            <div>
                                <div className="text-[10px] font-black text-white uppercase">查看食材耗損分析</div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase">分析您過去的食材利用效率</div>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-600" />
                    </button>

                    <button 
                        onClick={() => {
                            if (window.confirm("確定要清空所有存儲的食材數據嗎？")) {
                                clearAll();
                                alert("數據已重置。");
                            }
                        }}
                        className="w-full flex items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10 hover:bg-red-500/10 transition-all text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><LogOut size={18} className="text-red-500" /></div>
                            <div>
                                <div className="text-[10px] font-black text-red-500 uppercase font-black">清空所有資料</div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase">重置所有存儲的食材記錄</div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <div className="text-center">
                <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">VERSION 1.0.0 LITE / NEURAL CORE v2</div>
            </div>
        </div>
    );
}
