import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Package, Sparkles, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScannedItem, useIngredients } from "../../services/IngredientContext";

interface NeuralAnalyticsDashboardProps {
    data: any[];
    scannedItems: ScannedItem[];
}

export function NeuralAnalyticsDashboard({ data, scannedItems }: NeuralAnalyticsDashboardProps) {
    const { clearWasteHistory, removeWasteRecord, removeWasteItem } = useIngredients();
    const [tab, setTab] = useState<"history" | "predict">("history");
    const [chartPage, setChartPage] = useState(0); 
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    
    const selectedRecord = useMemo(() => {
        return data.find(d => d.date === selectedDate) || null;
    }, [data, selectedDate]);
    
    const chartData = Array.isArray(data) ? data : [];
    
    const PAGE_SIZE = 7;
    const endIdx = chartData.length - (chartPage * PAGE_SIZE);
    const startIdx = Math.max(0, endIdx - PAGE_SIZE);
    const visibleData = chartData.slice(Math.max(0, startIdx), Math.max(0, endIdx));

    const totalWaste = chartData.reduce((s, d) => s + (Number(d.amount) || 0), 0);
    const sustainabilityIndex = Math.max(0, 100 - (totalWaste * 2)); 
    const maxVal = Math.max(...chartData.map(d => Number(d.amount) || 0), 2);
    const chartHeight = 80;

    useEffect(() => {
        if (chartData.length > 0) {
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const todayRecord = chartData.find(d => d.date === dateStr);
            console.log(`📊 [Analytics] Context State Updated -> Today (${dateStr}) Waste:`, todayRecord?.amount || 0);
        }
    }, [chartData]);

    return (
        <div className="bg-[var(--card)]/30 rounded-[2.5rem] p-6 border border-white/5 mb-8 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--primary)]/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-20">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">食材損耗分析 (Waste Analytics)</h3>
                        {chartData.length > 0 && tab === "history" && (
                            <button 
                                onClick={() => { if(window.confirm("確定要清空所有統計數據嗎？")) clearWasteHistory(); }}
                                className="p-1 px-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-1"
                            >
                                <Trash2 size={10} />
                                <span className="text-[8px] font-black uppercase">清空</span>
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-xl font-black text-white tracking-tighter">{sustainabilityIndex}%</div>
                        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest border-l border-white/10 pl-2">食材利用效率</div>
                    </div>
                </div>
                <div className="flex bg-[var(--background)] p-1 rounded-xl border border-white/10 ml-4">
                    <button onClick={() => setTab("history")} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${tab === "history" ? "bg-[var(--primary)] text-[var(--background)]" : "text-gray-500"}`}>歷史</button>
                    <button onClick={() => setTab("predict")} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${tab === "predict" ? "bg-amber-400 text-[var(--background)]" : "text-gray-500"}`}>預測</button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {tab === "history" ? (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative w-full"
                    >
                        <div className="flex items-center justify-between mb-2 px-1">
                            <button 
                                onClick={() => setChartPage(p => p + 1)} 
                                disabled={startIdx === 0}
                                className={`p-1.5 rounded-full border border-white/10 transition-all ${startIdx === 0 ? 'opacity-20 grayscale' : 'bg-white/5 hover:bg-white/10 active:scale-90'}`}
                            >
                                <ChevronLeft size={16} className="text-white" />
                            </button>
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                                {visibleData.length > 0 ? `${visibleData[0].date} ~ ${visibleData[visibleData.length-1].date}` : "無數據"}
                            </span>
                            <button 
                                onClick={() => setChartPage(p => p - 1)} 
                                disabled={chartPage === 0}
                                className={`p-1.5 rounded-full border border-white/10 transition-all ${chartPage === 0 ? 'opacity-20 grayscale' : 'bg-white/5 hover:bg-white/10 active:scale-90'}`}
                            >
                                <ChevronRight size={16} className="text-white" />
                            </button>
                        </div>

                        <div className="h-[140px] w-full flex items-end justify-between px-2 pt-10 pb-4 relative">
                            {visibleData.length > 0 ? visibleData.map((d, i) => {
                                const height = (Number(d.amount) / maxVal) * chartHeight;
                                return (
                                    <div 
                                        key={i} 
                                        onClick={() => setSelectedDate(d.amount > 0 ? d.date : null)}
                                        className={`flex-1 flex flex-col items-center gap-2 group/bar relative cursor-pointer transition-transform ${selectedDate === d.date ? 'scale-110' : 'hover:scale-105'}`}
                                    >
                                        <div className="absolute top-0 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 -translate-y-4 group-hover/bar:-translate-y-2 flex flex-col items-center z-30">
                                            <span className="bg-[var(--primary)] text-[var(--background)] text-[8px] font-black px-2 py-1 rounded-lg tracking-widest shadow-[0_0_15px_rgba(0,255,136,0.3)] whitespace-nowrap">
                                                浪費 {d.amount}
                                            </span>
                                            <div className="w-1.5 h-1.5 bg-[var(--primary)] rotate-45 -mt-1" />
                                        </div>
                                        <div className="relative w-full flex items-end justify-center">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: Math.max(2, height) }}
                                                className={`w-4 sm:w-6 rounded-t-full transition-all duration-500 ${selectedDate === d.date ? 'bg-white brightness-150' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}
                                            />
                                        </div>
                                        <span className={`text-[7px] font-black transition-colors ${selectedDate === d.date ? 'text-white underline' : 'text-gray-500 group-hover/bar:text-white'}`}>
                                            {(() => {
                                                const parts = d.date.split("-");
                                                return `${Number(parts[1])}/${Number(parts[2])}`;
                                            })()}
                                        </span>
                                    </div>
                                );
                            }) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">無可顯示之數據</div>
                                </div>
                            )}
                            <div className="absolute bottom-4 left-0 w-full h-[1px] bg-white/5 -z-10" />
                            <div className="absolute top-2 left-0 text-[7px] font-black text-gray-500/50 uppercase tracking-widest">週損耗趨勢報表</div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="predict"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="py-2"
                    >
                        {(() => {
                            const total = scannedItems.length;
                            if (total === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                        <Package size={24} className="text-white/20 mb-3" />
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">請先新增食材以啟用預測</p>
                                    </div>
                                );
                            }

                            const riskItems = scannedItems.filter(i => {
                                const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
                                const daysLeft = (i.expiryDays !== undefined ? i.expiryDays : 7) - daysPassed;
                                return daysLeft > 0 && daysLeft <= 2 && !i.isSpoiled;
                            });
                            const warningItems = scannedItems.filter(i => {
                                const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
                                const daysLeft = (i.expiryDays !== undefined ? i.expiryDays : 7) - daysPassed;
                                return daysLeft > 2 && daysLeft <= 5 && !i.isSpoiled;
                            });
                            const safeItems = scannedItems.filter(i => {
                                const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
                                const daysLeft = (i.expiryDays !== undefined ? i.expiryDays : 7) - daysPassed;
                                return daysLeft > 5 && !i.isSpoiled;
                            });

                            const getWidth = (val: number) => `${Math.max((val / total) * 100, 0)}%`;

                            return (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mt-2 mb-2">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">全庫存壽命分佈預測</span>
                                        <span className="text-[8px] font-bold text-gray-500 uppercase">{total} ITEMS</span>
                                    </div>

                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex shadow-inner mb-4">
                                        {riskItems.length > 0 && <div style={{ width: getWidth(riskItems.length) }} className="bg-red-500 transition-all duration-1000 animate-pulse border-r border-[var(--background)]" />}
                                        {warningItems.length > 0 && <div style={{ width: getWidth(warningItems.length) }} className="bg-amber-400 transition-all duration-1000 border-r border-[var(--background)]" />}
                                        {safeItems.length > 0 && <div style={{ width: getWidth(safeItems.length) }} className="bg-[var(--primary)] transition-all duration-1000 border-r border-[var(--background)]" />}
                                        {(total - riskItems.length - warningItems.length - safeItems.length > 0) && <div style={{ width: getWidth(total - riskItems.length - warningItems.length - safeItems.length) }} className="bg-gray-600 transition-all duration-1000" />}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 relative z-10">
                                        <div className="bg-white/5 rounded-xl p-3 border text-left border-red-500/20 relative">
                                            <div className="text-[8px] font-black text-gray-500 uppercase mb-1">1-2 天 (高風險)</div>
                                            <div className="text-lg font-black text-red-500">{riskItems.length}</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3 border text-left border-amber-400/20 relative">
                                            <div className="text-[8px] font-black text-gray-500 uppercase mb-1">3-5 天 (需注意)</div>
                                            <div className="text-lg font-black text-amber-400">{warningItems.length}</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3 border text-left border-[var(--primary)]/20 relative">
                                            <div className="text-[8px] font-black text-gray-500 uppercase mb-1">&gt; 5 天 (安全)</div>
                                            <div className="text-lg font-black text-[var(--primary)]">{safeItems.length}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {tab === "history" && !selectedRecord && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 p-4 rounded-2xl bg-[var(--primary)]/5 border border-[var(--primary)]/10"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={12} className="text-[var(--primary)]" />
                            <span className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest">AI 智慧分析建議</span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-400 leading-relaxed">
                            {sustainabilityIndex > 80 
                                ? "您的食材管理非常出色！建議保持目前的採購頻率。您可以嘗試更多樣化的健康食譜。" 
                                : sustainabilityIndex > 50 
                                ? "利用率尚可，但部分食材有過期風險。建議優先處理「預測」分區中的紅區項目。" 
                                : "近期損耗較高。建議縮短單次採購量，並啟動「自動過期提醒」功能以降低浪費。"}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {tab === "history" && selectedRecord && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-white/5 bg-black/20 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-[8px] font-black text-[var(--primary)] uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={10} /> {selectedDate} 浪費清單
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => { if(window.confirm(`確定要刪除 ${selectedDate} 的所有記錄嗎？`)) { removeWasteRecord(selectedDate!); setSelectedDate(null); } }}
                                        className="text-[8px] font-black text-red-400 hover:text-red-500 uppercase flex items-center gap-1 border border-red-500/20 px-2 py-1 rounded-lg"
                                    >
                                        <Trash2 size={8} /> 刪除當日
                                    </button>
                                    <button onClick={() => setSelectedDate(null)} className="text-[8px] font-black text-gray-500 uppercase px-2 py-1">返回</button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedRecord.items?.map((item: string, idx: number) => (
                                    <div key={idx} className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2 group/item">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-white uppercase">{item}</span>
                                        <button 
                                            onClick={() => removeWasteItem(selectedDate!, item)}
                                            className="text-red-500/50 hover:text-red-500 transition-colors"
                                        >
                                            <X size={10} strokeWidth={4} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
