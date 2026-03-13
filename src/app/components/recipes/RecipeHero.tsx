import { useIngredients } from "../../services/IngredientContext";

interface RecipeHeroProps {
    image: string;
    name: string;
}

export function RecipeHero({ image, name }: RecipeHeroProps) {
    return (
        <div className="relative h-80 overflow-hidden">
            <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/20 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="px-3 py-1 bg-[var(--primary)] text-[var(--background)] text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg">
                        98% Compatible
                    </div>
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">
                    {name}
                </h2>
            </div>
        </div>
    );
}
