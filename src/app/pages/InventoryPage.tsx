import { useNavigate } from "react-router";
import { useState } from "react";
import { 
    Plus, ChefHat, Snowflake, Search, Mic, 
    ChevronLeft, ChevronRight, Sparkles, Loader2, 
    Package, Trash2, Edit2, Clock, X, AlertTriangle, Minus
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { PageHeader, SecondaryButton, GlowCard } from "../components/Shared";
import { useIngredients, ScannedItem } from "../services/IngredientContext";
import { InventoryStats } from "../components/inventory_management/InventoryStats";
import { AddEntryForm } from "../components/inventory_management/AddEntryForm";
import { EditItemModal } from "../components/inventory_management/EditItemModal";

export function InventoryPage() {
    const navigate = useNavigate();
    const { 
        scannedItems, addItem, updateQuantity, removeItems, removeItem: removeIngredient, 
        selectedIds, toggleSelection, generateRecipe, updateItem 
    } = useIngredients();

    const [isGenerating, setIsGenerating] = useState(false);
    const [search, setSearch] = useState(""); 
    const [cat, setCat] = useState("全部"); 
    const [showForm, setShowForm] = useState(false); 
    const [storageTab, setStorageTab] = useState<"fridge" | "freezer">("fridge");
    const [editingItem, setEditingItem] = useState<ScannedItem | null>(null); 
    const [isListening, setIsListening] = useState(false); 

    const categories = ["全部", "蔬菜", "水果", "乳製品", "肉類", "五穀", "其他"];
    const [catPage, setCatPage] = useState(0);

    const startVoiceInput = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("您的瀏覽器不支援語音辨識功能！");

        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-TW';
        recognition.start();
        setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearch(transcript);
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
    };

    const filtered = scannedItems.filter(i =>
        (i.storageType || "fridge") === storageTab &&
        (cat === "全部" || i.category === cat) &&
        i.name.toLowerCase().includes(search.toLowerCase())
    );

    const expiredCount = scannedItems.filter((i: ScannedItem) => {
        const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
        const expiryDays = i.expiryDays !== undefined ? i.expiryDays : 7;
        const daysLeft = expiryDays - daysPassed;
        return daysLeft <= 0 || i.isSpoiled; 
    }).length;

    const handleSaveEdit = (id: string, updates: Partial<ScannedItem>) => {
        updateItem(id, { ...updates, timestamp: Date.now() });
        setEditingItem(null);
    };

    return (
        <div className="pb-24">
            <PageHeader 
                showBackButton 
                title={selectedIds.length > 0 ? `已選擇 ${selectedIds.length} 項` : "食材清單"} 
                rightAction={
                    <div className="flex items-center gap-2">
                        <AnimatePresence>
                            {selectedIds.length > 0 && (
                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    onClick={() => {
                                        if (window.confirm(`確定要刪除這 ${selectedIds.length} 項食材嗎？`)) {
                                            removeItems(selectedIds);
                                        }
                                    }}
                                    className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={20} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                        <button onClick={() => setShowForm(!showForm)} className="p-1.5 bg-[var(--primary)] rounded-xl shadow-lg">
                            <Plus size={20} className="text-[var(--background)] stroke-[3]" />
                        </button>
                    </div>
                } 
            />

            <div className="bg-[var(--background)] sticky top-[64px] z-20 pb-4 px-6 py-4">
                <div className="flex bg-white/5 p-1 rounded-2xl mb-4">
                    <button onClick={() => setStorageTab('fridge')} className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${storageTab === 'fridge' ? 'bg-[var(--primary)] text-[var(--background)]' : 'text-gray-400'}`}><ChefHat size={16} />冷藏庫</button>
                    <button onClick={() => setStorageTab('freezer')} className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${storageTab === 'freezer' ? 'bg-blue-400 text-[var(--background)]' : 'text-gray-400'}`}><Snowflake size={16} />冷凍庫</button>
                </div>

                <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input type="text" placeholder="搜尋食材..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[var(--primary)] text-sm font-bold placeholder:text-gray-600 outline-none" />
                    </div>
                    <button onClick={startVoiceInput} className={`p-4 rounded-2xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                        <Mic size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-2 mt-4">
                    <button 
                        onClick={() => setCatPage(p => Math.max(0, p - 1))}
                        disabled={catPage === 0}
                        className={`p-2 rounded-xl border border-white/10 transition-all ${catPage === 0 ? 'opacity-20 grayscale' : 'bg-white/5 hover:bg-white/10 active:scale-90'}`}
                    >
                        <ChevronLeft size={14} className="text-white" />
                    </button>
                    
                    <div className="flex-1 flex gap-2 overflow-hidden items-center justify-start">
                        {categories.slice(catPage * 4, (catPage + 1) * 4).map(c => (
                            <button 
                                key={c} 
                                onClick={() => setCat(c)} 
                                className={`flex-1 px-2 py-2.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap border transition-all duration-300 ${cat === c ? (storageTab === 'fridge' ? "bg-[var(--primary)] text-[var(--background)] border-[var(--primary)] shadow-[var(--primary-glow)] scale-105" : "bg-blue-400 text-[var(--background)] border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.3)] scale-105") : "bg-white/5 text-gray-500 border-white/10"}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setCatPage(p => Math.min(Math.ceil(categories.length / 4) - 1, p + 1))}
                        disabled={(catPage + 1) * 4 >= categories.length}
                        className={`p-2 rounded-xl border border-white/10 transition-all ${(catPage + 1) * 4 >= categories.length ? 'opacity-20 grayscale' : 'bg-white/5 hover:bg-white/10 active:scale-90'}`}
                    >
                        <ChevronRight size={14} className="text-white" />
                    </button>
                </div>
            </div>

            <div className="px-6 mb-2">
                <button
                    onClick={async () => {
                        setIsGenerating(true);
                        try {
                            await generateRecipe();
                            navigate("/recipes");
                        } catch (e: any) {
                            alert(e.message);
                        } finally {
                            setIsGenerating(false);
                        }
                    }}
                    disabled={isGenerating || selectedIds.length === 0}
                    className={`w-full ${storageTab === 'fridge' ? 'bg-[var(--primary)]' : 'bg-blue-400'} text-[var(--background)] py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-[var(--primary-glow)] flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]`}
                >
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {isGenerating ? "Synthesizing..." : "生成 AI 食譜方案"}
                </button>
            </div>

            <InventoryStats freshItems={scannedItems.length - expiredCount} expiredItems={expiredCount} />

            {showForm && (<AddEntryForm onAdd={(item) => addItem(item, "manual")} onDismiss={() => setShowForm(false)} categories={["全部", "蔬菜", "水果", "乳製品", "肉類", "五穀", "其他"]} />)}

            <div className="px-6 py-4">
                <h3 className="font-black text-xs uppercase text-white/30 mb-4 px-2">存貨紀錄 ({filtered.length})</h3>
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <GlowCard className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[3.5rem] border border-white/5">
                            <Package size={48} className="mx-auto mb-4 text-white/10" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">目前該區域無庫存紀錄</p>
                        </GlowCard>
                    ) : (
                        <LayoutGroup>
                            <motion.div className="space-y-3">
                                {filtered.map((i: ScannedItem) => {
                                    const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
                                    const expiryDays = i.expiryDays !== undefined ? i.expiryDays : 7;
                                    const daysLeft = expiryDays - daysPassed;
                                    const isExpired = daysLeft <= 0;
                                    const isWarning = !isExpired && daysLeft <= 2;

                                    return (
                                        <motion.div 
                                            key={i.id} 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            style={{ willChange: "transform, opacity" }}
                                            className={`bg-[var(--card)]/30 rounded-2xl p-4 border transition-all relative overflow-hidden group ${i.isSpoiled || isExpired ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : isWarning ? 'border-amber-400/50 bg-amber-400/5 shadow-[0_0_20px_rgba(251,191,36,0.1)]' : 'border-white/5'}`}
                                        >

                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => toggleSelection(i.id)}
                                                    disabled={i.isSpoiled || isExpired}
                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${i.isSpoiled || isExpired ? 'opacity-20 cursor-not-allowed border-gray-600' : selectedIds.includes(i.id) ? (storageTab === 'fridge' ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-blue-400 border-blue-400') : 'bg-transparent border-white/20'}`}
                                                >
                                                    {selectedIds.includes(i.id) && !i.isSpoiled && !isExpired && <div className="w-3 h-3 bg-[var(--background)] rounded-sm" />}
                                                    {(i.isSpoiled || isExpired) && <X size={12} className="text-red-500" />}
                                                </button>

                                                <div className="w-12 h-12 rounded-xl bg-[var(--background)] flex items-center justify-center flex-shrink-0 relative">
                                                    <Package size={20} className={i.isSpoiled || isExpired ? "text-red-500" : storageTab === 'fridge' ? "text-[var(--primary)]" : "text-blue-400"} />
                                                    {(i.isSpoiled || isExpired) && <div className="absolute inset-0 bg-red-500/10 rounded-xl" />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`font-black text-sm truncate uppercase ${i.isSpoiled || isExpired ? 'text-red-500/70 line-through' : 'text-white'}`}>{i.name}</h4>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${i.isSpoiled ? 'bg-red-500/10 text-red-500' : storageTab === 'fridge' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-blue-400/10 text-blue-400'}`}>
                                                            {i.isSpoiled ? "品質異常" : (i.category || "其他")}
                                                        </span>
                                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${isExpired || i.isSpoiled ? 'bg-red-500 text-white' : isWarning ? 'bg-amber-400 text-[var(--background)]' : 'bg-white/5 text-gray-400'}`}>
                                                            <Clock size={8} />
                                                            {isExpired ? "已過期 (EXPIRED)" : i.isSpoiled ? "偵測毀損" : isWarning ? `即將到期 (${daysLeft}天)` : `保鮮 ${daysLeft} 天`}
                                                        </span>
                                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 bg-white/5 text-gray-400">
                                                            {new Date(i.timestamp || Date.now()).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setEditingItem(i)} className="w-8 h-8 rounded-full bg-white/5 text-gray-400 flex items-center justify-center hover:text-white hover:bg-white/10 transition-colors">
                                                        <Edit2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-3">
                                                <div className="flex items-center bg-[var(--background)]/80 rounded-full p-1 border border-white/10">
                                                    <button onClick={() => updateQuantity(i.id, -1)} className={`w-7 h-7 flex items-center justify-center text-gray-500 hover:${storageTab === 'fridge' ? 'text-[var(--primary)]' : 'text-blue-400'}`}><Minus size={12} strokeWidth={3} /></button>
                                                    <span className="w-8 text-center font-black text-white text-xs">{i.quantity}</span>
                                                    <button onClick={() => updateQuantity(i.id, 1)} className={`w-7 h-7 flex items-center justify-center text-gray-500 hover:${storageTab === 'fridge' ? 'text-[var(--primary)]' : 'text-blue-400'}`}><Plus size={12} strokeWidth={3} /></button>
                                                </div>
                                                <button onClick={() => removeIngredient(i.id)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center transition-all hover:bg-red-500 hover:text-white"><Trash2 size={12} strokeWidth={3} /></button>
                                            </div>

                                            {isWarning && !isExpired && (
                                                <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                                                    <div className="absolute top-[-10px] right-[-10px] bg-amber-400 w-12 h-12 rotate-45 transform origin-bottom-left flex items-end justify-center pb-1">
                                                        <AlertTriangle size={8} className="text-[var(--background)] -rotate-45" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </LayoutGroup>
                    )}
                </AnimatePresence>
            </div>

            {editingItem && (
                <EditItemModal
                    item={editingItem}
                    onSave={handleSaveEdit}
                    onDismiss={() => setEditingItem(null)}
                />
            )}
        </div>
    );
}
