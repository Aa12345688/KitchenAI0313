import React from "react";
import { useNavigate } from "react-router";
import { 
    User, Settings, AlertTriangle, Sparkles, 
    HelpCircle, ChevronRight, LogOut, Cpu, Key, Plus, Trash2, Moon, UtensilsCrossed,
    RefreshCw, CheckCircle2, XCircle
} from "lucide-react";
import { PageHeader } from "../components/Shared";
import { useIngredients } from "../services/IngredientContext";
import { notificationService } from "../services/notificationService";
import { llmService } from "../services/llmService";

export function ProfilePage() {
    const { settings, updateSettings, clearAll } = useIngredients();
    const nav = useNavigate();
    const [newKey, setNewKey] = React.useState("");
    const [isTesting, setIsTesting] = React.useState(false);
    const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null);

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

    const runApiTest = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const result = await llmService.testConnection();
            setTestResult(result);
        } catch (e: any) {
            setTestResult({ success: false, message: e.message });
        } finally {
            setIsTesting(false);
        }
    };

    const modelGroups = [
        {
            provider: "Google Gemini",
            badge: "FREE",
            badgeColor: "text-emerald-400 bg-emerald-400/10",
            models: [
                { id: "gemini-1.5-flash", label: "1.5 Flash", note: "穩定首選" },
                { id: "gemini-1.5-flash-8b", label: "1.5 Flash-8B", note: "輕量速速" },
                { id: "gemini-2.0-flash-lite", label: "2.0 Flash-Lite", note: "1500次/天" },
                { id: "gemini-2.0-flash", label: "2.0 Flash", note: "高效" },
                { id: "gemini-1.5-pro", label: "1.5 Pro", note: "高品質" },
            ]
        },
    ];

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
                    {/* Diagnostic Tool Section */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-5 mb-2">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                                    <Sparkles size={16} className="text-[var(--primary)]" />
                                </div>
                                <span className="text-[10px] font-black text-white uppercase">API 狀態診斷</span>
                            </div>
                            <button 
                                onClick={runApiTest}
                                disabled={isTesting}
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${isTesting ? 'bg-white/5 text-gray-500' : 'bg-[var(--primary)] text-[var(--background)] shadow-lg active:scale-95'}`}
                            >
                                {isTesting ? '診斷中...' : '開始測試'}
                            </button>
                        </div>
                        
                        {testResult && (
                            <div className={`flex items-start gap-3 p-3 rounded-2xl border ${testResult.success ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                {testResult.success ? <CheckCircle2 size={16} className="text-emerald-400 mt-0.5" /> : <XCircle size={16} className="text-red-400 mt-0.5" />}
                                <div className="flex-1">
                                    <div className={`text-[9px] font-black uppercase ${testResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {testResult.success ? '測試成功' : '測試失敗'}
                                    </div>
                                    <div className="text-[10px] text-white/70 font-bold leading-tight mt-1">{testResult.message}</div>
                                </div>
                            </div>
                        )}
                        {!testResult && !isTesting && (
                            <div className="text-[10px] text-gray-500 font-bold text-center py-2">
                                點擊按鈕確認當前 API 金鑰是否有效
                            </div>
                        )}
                    </div>

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

                    <div className="pt-2 border-t border-white/5 mt-6 pt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center"><Cpu size={18} className="text-[var(--primary)]" /></div>
                            <div>
                                <div className="text-[10px] font-black text-white uppercase">AI 推理模型 (Neural Engine)</div>
                                <div className="text-[8px] font-bold text-gray-500 uppercase">動態切換後端運算核心</div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {modelGroups.map(group => (
                                <div key={group.provider}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{group.provider}</span>
                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full ${group.badgeColor}`}>{group.badge}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {group.models.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => updateSettings({ model: m.id })}
                                                className={`flex flex-col items-start px-3 py-2 rounded-xl transition-all border ${settings.model === m.id ? 'bg-[var(--primary)] text-[var(--background)] border-[var(--primary)]' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
                                            >
                                                <span className="text-[9px] font-black uppercase">{m.label}</span>
                                                <span className={`text-[7px] font-bold ${settings.model === m.id ? 'opacity-70' : 'text-gray-600'}`}>{m.note}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
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
                </div>
            </div>

            <div className="bg-[var(--card)]/20 p-6 rounded-[2.5rem] border border-white/5 mb-8">
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6 px-1">資料與權限管理 (Danger Zone)</h3>
                <div className="space-y-4">
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
                <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">VERSION 1.0.0 STABLE / NEURAL CORE v2.1</div>
            </div>
        </div>
    );
}
