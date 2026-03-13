import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { 
    Clock, ChefHat, Users, Sparkles, BookOpen, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "../components/Shared";
import { useIngredients } from "../services/IngredientContext";
import { llmService } from "../services/llmService";
import { RecipeHero } from "../components/recipes/RecipeHero";
import { IngredientChecklist } from "../components/recipes/IngredientChecklist";
import { CookingProtocol } from "../components/recipes/CookingProtocol";
import { recipeDatabase } from "../data/recipes";

export function RecipeDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();
    const { recommendedRecipes, scannedItems, setRecipes, saveRecipe, savedRecipes } = useIngredients();

    const [showSaveModal, setShowSaveModal] = useState(false);

    const recipe = recommendedRecipes.find(r => r.id === id) ||
        recipeDatabase.find(r => r.id === id) ||
        savedRecipes.find(r => r.id === id) ||
        {
            name: "AI 合成食譜",
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
            time: "15 分鐘",
            difficulty: "簡單",
            requiredIngredients: ["番茄", "菠菜"],
            optionalIngredients: [],
            description: "智慧生成食譜。"
        };

    const [checked, setChecked] = useState<boolean[]>([]);
    
    useEffect(() => {
        if (recipe && recipe.requiredIngredients) {
            setChecked(new Array(recipe.requiredIngredients.length).fill(false));
        }
    }, [recipe]);

    return (
        <div className="pb-32">
            <PageHeader showBackButton title="烹飪指南" />
            <RecipeHero image={recipe.image} name={recipe.name} />
            <div className="px-6 py-8">
                <div className="grid grid-cols-3 gap-3 mb-10">
                    {[{ i: Clock, v: recipe.time }, { i: ChefHat, v: recipe.difficulty }, { i: Users, v: "2-3人份" }].map((s, i) => (
                        <div key={i} className="bg-white/5 rounded-2xl p-4 text-center">
                            <s.i className="w-4 h-4 mx-auto mb-2 text-[var(--primary)]" />
                            <div className="text-xs font-black text-white">{s.v}</div>
                        </div>
                    ))}
                </div>
                <IngredientChecklist 
                    ingredients={recipe.requiredIngredients} 
                    checkedItems={checked} 
                    onToggle={(i) => { const n = [...checked]; n[i] = !n[i]; setChecked(n); }} 
                    progress={Math.round((checked.filter(Boolean).length / recipe.requiredIngredients.length) * 100)} 
                />
                <CookingProtocol steps={recipe.steps || [{ title: "初始化", description: "準備食材。" }, { title: "執行", description: "標準烹飪。" }]} />

                <div className="mt-12 mb-8 px-2">
                    <button
                        onClick={async () => {
                            try {
                                const ingredientsToUse = scannedItems.map(i => i.name);
                                const res = await llmService.generateRecipes({ ingredients: ingredientsToUse });
                                setRecipes(res);
                                alert("AI 食譜已重新合成！");
                            } catch (e: any) {
                                alert("更新食譜失敗");
                            }
                        }}
                        className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-5 rounded-2xl text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em] hover:bg-[var(--primary)]/10 transition-all shadow-lg text-center"
                    >
                        <Sparkles size={18} />
                        重新分析並合成新方案
                    </button>
                </div>

                <button 
                    onClick={() => {
                        saveRecipe(recipe);
                        setShowSaveModal(true);
                    }} 
                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase shadow-lg flex items-center justify-center gap-3 mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all ${savedRecipes.find(r => r.id === recipe.id) ? 'bg-white/10 text-white' : 'bg-[var(--primary)] text-[var(--background)]'}`}
                >
                    <BookOpen size={20} />
                    {savedRecipes.find(r => r.id === recipe.id) ? '已儲存此食譜' : '儲存食譜'}
                </button>
            </div>

            <AnimatePresence>
                {showSaveModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[var(--background)]/90 backdrop-blur-xl flex items-center justify-center p-6 pb-[15vh] sm:pb-6">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[var(--card)] w-full max-w-sm max-h-[75vh] flex flex-col rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">

                            <button onClick={() => setShowSaveModal(false)} className="absolute right-4 top-4 z-20 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-gray-300 hover:text-white backdrop-blur-md transition-colors">
                                <X size={16} />
                            </button>

                            <div className="p-6 pb-4 shrink-0 relative z-10 border-b border-white/5 bg-[var(--card)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-2xl flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/10 shadow-lg">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-widest">食譜已儲存</h3>
                                        <div className="text-[10px] font-bold tracking-widest text-[var(--primary)] mt-0.5">已同步至雲端與暫存清單</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto w-full flex-1 relative z-10 space-y-4 bg-[var(--background)]/30">
                                <div>
                                    <h4 className="font-black text-xl text-white tracking-widest mb-2 leading-tight flex items-start gap-2">
                                        <ChefHat size={18} className="text-[var(--primary)] mt-1 shrink-0" />
                                        {recipe.name}
                                    </h4>
                                    <div className="text-[11px] text-gray-400 font-bold leading-relaxed">{recipe.description}</div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
                                    <div className="text-[10px] text-[var(--primary)] mb-3 font-black uppercase tracking-widest flex items-center gap-2">
                                        <ChefHat size={12} />所需食材
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {recipe.requiredIngredients.map((ing: string, idx: number) => (
                                            <span key={idx} className="bg-black/30 border border-white/10 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold">
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
                                    <div className="text-[10px] text-amber-400 mb-3 font-black uppercase tracking-widest flex items-center gap-2">
                                        <BookOpen size={12} />烹飪步驟
                                    </div>
                                    <div className="space-y-4">
                                        {recipe.steps ? recipe.steps.map((s: any, idx: number) => (
                                            <div key={idx} className="flex gap-3">
                                                <div className="w-6 h-6 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0 border border-amber-400/20">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="text-white font-black text-[11px] tracking-wider mb-1 mt-0.5">{s.title}</div>
                                                    <div className="text-gray-400 text-[10px] leading-relaxed font-bold">{s.description}</div>
                                                </div>
                                            </div>
                                        )) : <div className="text-[10px] text-gray-500 font-bold tracking-widest">無詳細步驟</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 shrink-0 relative z-10 bg-[var(--card)] border-t border-white/5">
                                <button onClick={() => { setShowSaveModal(false); nav("/saved"); }} className="w-full bg-[var(--primary)] text-[var(--background)] py-4 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
                                    前往數據統計查看
                                </button>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
