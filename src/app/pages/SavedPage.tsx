import { useNavigate } from "react-router";
import { BookOpen, Trash2 } from "lucide-react";
import { PageHeader } from "../components/Shared";
import { useIngredients } from "../services/IngredientContext";
import { NeuralAnalyticsDashboard } from "../components/analytics/NeuralAnalyticsDashboard";
import { RecipeCard } from "../components/recipes/RecipeCard";

export function SavedPage() {
    const nav = useNavigate();
    const { wasteHistory, scannedItems, savedRecipes, unsaveRecipe } = useIngredients();

    return (
        <div className="pb-24 pt-6">
            <PageHeader showBackButton title="數據統計" />
            <div className="px-6 mb-8 mt-2 text-left">
                <NeuralAnalyticsDashboard data={wasteHistory} scannedItems={scannedItems} />
            </div>

            {savedRecipes.length === 0 ? (
                <div className="px-6 flex flex-col items-center justify-center py-12 text-center bg-white/5 rounded-[2rem] border border-white/5 mx-6">
                    <div className="w-20 h-20 bg-[var(--primary)]/5 rounded-full border border-[var(--primary)]/10 flex items-center justify-center mb-6">
                        <BookOpen size={32} className="text-[var(--primary)]/20" />
                    </div>
                    <h2 className="text-[11px] font-black text-white/50 uppercase mb-5 tracking-widest">暫無儲存的食譜方案</h2>
                    <button onClick={() => nav("/")} className="bg-[var(--primary)] text-[var(--background)] px-10 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg hover:scale-105 transition-all">
                        啟動掃描器去發掘
                    </button>
                </div>
            ) : (
                <div className="px-6 space-y-6">
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2">我的收藏食譜 ({savedRecipes.length})</h3>
                    <div className="grid grid-cols-1 gap-6">
                        {savedRecipes.map((recipe) => (
                            <div key={recipe.id} className="relative group">
                                <RecipeCard 
                                    recipe={recipe} 
                                    onClick={() => nav(`/recipe/${recipe.id}`)}
                                    getCategoryLabel={(c) => c === "vegetable" ? "蔬菜" : c === "fruit" ? "水果" : c === "meat" ? "肉類" : "綜合"}
                                />
                                <button 
                                    onClick={(e) => { e.stopPropagation(); unsaveRecipe(recipe.id); }}
                                    className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-red-500/20 text-red-500 border border-red-500/20 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
