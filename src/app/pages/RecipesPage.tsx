import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Share2, Sparkles, ChefHat } from "lucide-react";
import { PageHeader } from "../components/Shared";
import { useIngredients } from "../services/IngredientContext";
import { llmService } from "../services/llmService";
import { RecipeCard } from "../components/recipes/RecipeCard";
import { IngredientCloud } from "../components/recipes/IngredientCloud";
import { getRecommendedRecipes } from "../data/recipes";

export function RecipesPage() {
    const navigate = useNavigate();
    const { scannedItems, recommendedRecipes, setRecipes } = useIngredients();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (scannedItems.length > 0 && recommendedRecipes.length === 0) {
            const fetchRecipes = async () => {
                setIsLoading(true);
                try {
                    const res = await llmService.generateRecipes({ ingredients: scannedItems.map(i => i.name) });
                    setRecipes(res);
                } catch (error) {
                    setRecipes(getRecommendedRecipes(scannedItems)); // Local fallback
                } finally { 
                    setIsLoading(false); 
                }
            };
            fetchRecipes();
        } else { 
            setIsLoading(false); 
        }
    }, [scannedItems, recommendedRecipes, setRecipes]);

    return (
        <div className="pb-24">
            <PageHeader 
                showBackButton 
                title="AI 推薦食譜" 
                rightAction={
                    <button className="p-2.5 bg-white/5 rounded-2xl hover:bg-white/10">
                        <Share2 size={20} className="text-white" />
                    </button>
                } 
            />
            <div className="px-6 py-4">
                <IngredientCloud items={scannedItems} onAddMore={() => navigate("/inventory")} />
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-6 bg-white/5 rounded-[3rem] border border-white/10">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-2 border-[var(--primary)]/20 rounded-full" />
                            <div className="absolute inset-0 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                            <Sparkles className="absolute inset-0 m-auto text-[var(--primary)] animate-pulse" size={20} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-[var(--primary)] font-black text-xs uppercase animate-pulse mb-1">運算中...</h3>
                            <p className="text-gray-500 text-[9px] font-bold uppercase">正在分析口味分佈</p>
                        </div>
                    </div>
                ) : recommendedRecipes.length > 0 ? (
                    <div className="space-y-8">
                        <div className="bg-[var(--card)]/40 backdrop-blur-md rounded-[2.5rem] p-6 border border-[var(--primary)]/20 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-lg">
                                <ChefHat size={24} className="text-[var(--background)]" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-black text-xs text-white uppercase mb-1">AI 神經網路推薦</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase leading-tight">
                                    已優化 <span className="text-[var(--primary)]">{recommendedRecipes.length} 個相容節點</span> <br />
                                    惜食減廢協議已啟動
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-10">
                            {recommendedRecipes.map((r) => (
                                <RecipeCard 
                                    key={r.id} 
                                    recipe={r} 
                                    onClick={() => navigate(`/recipe/${r.id}`)} 
                                    getCategoryLabel={(c) => c === "vegetable" ? "蔬菜" : c === "fruit" ? "水果" : c === "meat" ? "肉類" : "綜合"} 
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-24 px-8 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5">
                        <div className="w-20 h-20 mx-auto mb-6 bg-[var(--primary)]/5 rounded-full flex items-center justify-center">
                            <ChefHat size={40} className="text-[var(--primary)]/20" />
                        </div>
                        <h4 className="text-white font-black text-sm uppercase mb-2">未發現相容方案</h4>
                        <button onClick={() => navigate("/")} className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--primary)] text-[var(--background)] rounded-2xl font-black uppercase text-[10px]">
                            返回掃描
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
