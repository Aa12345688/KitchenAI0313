/**
 * 50 張精選食譜示意圖庫
 * 使用 Unsplash 穩定圖片，按料理類型與關鍵字分類
 */

interface RecipeImage {
    url: string;
    keywords: string[];
    category: "vegetable" | "fruit" | "meat" | "mixed" | "seafood" | "soup" | "rice" | "noodle" | "egg" | "tofu";
}

export const RECIPE_IMAGE_LIBRARY: RecipeImage[] = [
    // 🥩 肉類料理
    { url: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=800", keywords: ["雞", "chicken", "烤雞", "雞腿"], category: "meat" },
    { url: "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?q=80&w=800", keywords: ["豬", "pork", "豬肉", "排骨", "五花"], category: "meat" },
    { url: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800", keywords: ["牛", "beef", "牛肉", "牛排", "漢堡"], category: "meat" },
    { url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800", keywords: ["炸雞", "雞塊", "炸物", "雞翅"], category: "meat" },
    { url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800", keywords: ["豬排", "炸豬排", "排骨"], category: "meat" },
    { url: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800", keywords: ["燉肉", "紅燒", "滷肉", "滷"], category: "meat" },
    { url: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=800", keywords: ["漢堡", "burger", "牛肉堡"], category: "mixed" },

    // 🐟 海鮮料理
    { url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800", keywords: ["魚", "鮭魚", "salmon", "海鮮"], category: "seafood" },
    { url: "https://images.unsplash.com/photo-1534482421-64566f976cfa?q=80&w=800", keywords: ["蝦", "shrimp", "蝦仁", "蝦子"], category: "seafood" },
    { url: "https://images.unsplash.com/photo-1559742811-822873691df8?q=80&w=800", keywords: ["海鮮", "seafood", "龍蝦", "蟹"], category: "seafood" },
    { url: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=800", keywords: ["烤魚", "魚排", "魚片"], category: "seafood" },
    { url: "https://images.unsplash.com/photo-1563248180-7eb04c0daadb?q=80&w=800", keywords: ["花枝", "透抽", "魷魚"], category: "seafood" },

    // 🥦 蔬菜料理
    { url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800", keywords: ["沙拉", "salad", "蔬菜", "生菜"], category: "vegetable" },
    { url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800", keywords: ["炒蔬菜", "青菜", "炒青菜", "花椰菜"], category: "vegetable" },
    { url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800", keywords: ["番茄", "tomato", "蔬菜", "沙拉"], category: "vegetable" },
    { url: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=800", keywords: ["南瓜", "pumpkin", "地瓜", "根莖"], category: "vegetable" },
    { url: "https://images.unsplash.com/photo-1516684732162-798a0062be99?q=80&w=800", keywords: ["茄子", "紫色", "蔬菜"], category: "vegetable" },
    { url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800", keywords: ["菠菜", "菜", "綠色蔬菜", "菜葉"], category: "vegetable" },

    // 🍳 蛋料理
    { url: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=800", keywords: ["蛋", "egg", "炒蛋", "蛋料理"], category: "egg" },
    { url: "https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?q=80&w=800", keywords: ["荷包蛋", "煎蛋", "蛋", "太陽蛋"], category: "egg" },
    { url: "https://images.unsplash.com/photo-1590412200988-a436970781fa?q=80&w=800", keywords: ["歐姆蛋", "蛋捲", "omelet", "蛋包"], category: "egg" },
    { url: "https://images.unsplash.com/photo-1567177662154-dfeb4c93b6ae?q=80&w=800", keywords: ["茶葉蛋", "滷蛋", "溏心蛋"], category: "egg" },

    // 🍚 飯類料理
    { url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=800", keywords: ["炒飯", "rice", "飯", "蛋炒飯"], category: "rice" },
    { url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800", keywords: ["壽司", "sushi", "日式", "握壽司"], category: "rice" },
    { url: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?q=80&w=800", keywords: ["飯糰", "onigiri", "日式飯", "便當"], category: "rice" },
    { url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=800", keywords: ["燉飯", "risotto", "奶油飯", "義式飯"], category: "rice" },
    { url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800", keywords: ["白飯", "米飯", "飯", "主食"], category: "rice" },
    { url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=800", keywords: ["咖哩飯", "咖哩", "curry"], category: "rice" },

    // 🍜 麵類料理
    { url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800", keywords: ["拉麵", "ramen", "湯麵", "日式麵"], category: "noodle" },
    { url: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=800", keywords: ["義大利麵", "pasta", "spaghetti", "麵"], category: "noodle" },
    { url: "https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=800", keywords: ["炒麵", "stir fry noodle", "乾麵"], category: "noodle" },
    { url: "https://images.unsplash.com/photo-1584278858536-52532423b4c8?q=80&w=800", keywords: ["烏龍麵", "udon", "日式湯麵"], category: "noodle" },
    { url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=800", keywords: ["冬粉", "寬粉", "粉絲", "越式"], category: "noodle" },

    // 🍲 湯品料理
    { url: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800", keywords: ["湯", "soup", "燉湯", "雞湯"], category: "soup" },
    { url: "https://images.unsplash.com/photo-1534482421-64566f976cfa?q=80&w=800", keywords: ["味噌湯", "miso", "日式湯"], category: "soup" },
    { url: "https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=800", keywords: ["番茄湯", "蔬菜湯", "清湯"], category: "soup" },
    { url: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?q=80&w=800", keywords: ["奶油湯", "濃湯", "cream soup", "玉米湯"], category: "soup" },
    { url: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=800", keywords: ["麻辣鍋", "火鍋", "鍋物", "麻辣"], category: "soup" },

    // 🫘 豆腐料理
    { url: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?q=80&w=800", keywords: ["豆腐", "tofu", "麻婆豆腐", "豆類"], category: "tofu" },
    { url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800", keywords: ["豆腐", "冷豆腐", "涼拌豆腐"], category: "tofu" },

    // 🍎 水果料理/甜點
    { url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800", keywords: ["甜點", "dessert", "蛋糕", "點心"], category: "fruit" },
    { url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800", keywords: ["沙拉", "水果沙拉", "水果", "fruit"], category: "fruit" },

    // 🥗 綜合/中式料理
    { url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800", keywords: ["韓式", "泡菜", "kimchi", "韓式料理"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?q=80&w=800", keywords: ["中式", "中餐", "家常菜", "炒菜"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=800", keywords: ["印度", "香料", "辣", "燉煮"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800", keywords: ["披薩", "pizza", "義式", "焗烤"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=800", keywords: ["墨西哥", "塔可", "taco", "捲餅"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=800", keywords: ["豐盛", "大餐", "節日", "宴客", "多樣"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800", keywords: ["法式", "西餐", "精緻", "高級"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=800", keywords: ["早餐", "pancake", "吐司", "鬆餅"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=800", keywords: ["輕食", "健康", "沙拉碗", "bowl"], category: "vegetable" },

    // 🔥 新增 50 張 (第二批)
    // 🥩 更多肉類
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800", keywords: ["烤肉", "BBQ", "燒烤", "碳烤"], category: "meat" },
    { url: "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?q=80&w=800", keywords: ["雞胸", "水煮雞", "健康雞肉", "沙拉雞"], category: "meat" },
    { url: "https://images.unsplash.com/photo-1570197571499-166b36435e9f?q=80&w=800", keywords: ["豬腳", "蹄膀", "燉豬腳", "紅燒豬"], category: "meat" },
    { url: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?q=80&w=800", keywords: ["羊肉", "羊排", "烤羊", "lamb"], category: "meat" },
    { url: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?q=80&w=800", keywords: ["燻肉", "培根", "bacon", "煙燻"], category: "meat" },
    { url: "https://images.unsplash.com/photo-1607116667981-ff348a3f9c9a?q=80&w=800", keywords: ["叉燒", "港式", "廣式", "叉燒肉"], category: "meat" },

    // 🐟 更多海鮮
    { url: "https://images.unsplash.com/photo-1534482421-64566f976cfa?q=80&w=800", keywords: ["生蠔", "oyster", "貝類", "扇貝"], category: "seafood" },
    { url: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=800", keywords: ["蛤蜊", "蚌", "海瓜子", "淡菜"], category: "seafood" },
    { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800", keywords: ["熱炒", "海鮮炒", "快炒", "臺式"], category: "seafood" },
    { url: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=800", keywords: ["鱈魚", "白魚", "清蒸魚", "蒸魚"], category: "seafood" },
    { url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800", keywords: ["蝦捲", "蝦球", "鳳尾蝦", "大蝦"], category: "seafood" },

    // 🥦 更多蔬菜
    { url: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=800", keywords: ["紅蘿蔔", "carrot", "根莖蔬菜", "燉菜"], category: "vegetable" },
    { url: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?q=80&w=800", keywords: ["蘑菇", "菇類", "香菇", "mushroom"], category: "vegetable" },
    { url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?q=80&w=800", keywords: ["玉米", "corn", "玉米粒", "甜玉米"], category: "vegetable" },
    { url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=800", keywords: ["馬鈴薯", "potato", "薯", "炸薯條"], category: "vegetable" },
    { url: "https://images.unsplash.com/photo-1611170375832-a00cfcbf6bb7?q=80&w=800", keywords: ["蔥", "蒜", "薑", "辛香料"], category: "vegetable" },
    { url: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?q=80&w=800", keywords: ["青椒", "甜椒", "彩椒", "pepper"], category: "vegetable" },

    // 🍱 日式料理
    { url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800", keywords: ["便當", "bento", "日式便當", "定食"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1617196034183-421b4040d338?q=80&w=800", keywords: ["天婦羅", "tempura", "炸物", "日式炸"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?q=80&w=800", keywords: ["親子丼", "丼飯", "日式丼", "雞蛋丼"], category: "rice" },
    { url: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=800", keywords: ["茶碗蒸", "蒸蛋", "日式蒸蛋", "茶蒸"], category: "egg" },
    { url: "https://images.unsplash.com/photo-1598514982901-832cf95b6a21?q=80&w=800", keywords: ["唐揚", "炸雞塊", "日式炸雞", "karaage"], category: "meat" },

    // 🥡 中式料理
    { url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800", keywords: ["點心", "dim sum", "港式點心", "蝦餃"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?q=80&w=800", keywords: ["餃子", "水餃", "鍋貼", "煎餃"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1634864572865-1cf44bcf5e5d?q=80&w=800", keywords: ["饅頭", "包子", "小籠包", "蒸包"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800", keywords: ["麻婆", "宮保", "辣炒", "川菜"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=800", keywords: ["糖醋", "甜酸", "糖醋排骨", "紅燒"], category: "mixed" },

    // 🌮 異國料理
    { url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800", keywords: ["泰式", "打拋豬", "泰國", "thai"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1491156855053-9cdff72c7f85?q=80&w=800", keywords: ["越南", "越式", "春捲", "越南菜"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800", keywords: ["印度", "瑪薩拉", "咖哩", "masala"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=800", keywords: ["地中海", "greek", "希臘", "橄欖"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800", keywords: ["墨西哥捲", "burrito", "墨西哥", "捲餅"], category: "mixed" },

    // 🥪 麵包/三明治
    { url: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=800", keywords: ["三明治", "sandwich", "夾心", "吐司"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800", keywords: ["漢堡", "burger", "起司堡", "雙層堡"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800", keywords: ["麵包", "bread", "烤麵包", "baguette"], category: "mixed" },

    // ☕ 早餐
    { url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=800", keywords: ["早午餐", "brunch", "早餐", "鬆餅早餐"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800", keywords: ["燕麥", "oatmeal", "早餐碗", "穀物"], category: "mixed" },
    { url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=800", keywords: ["法式吐司", "french toast", "甜早餐", "蛋吐司"], category: "egg" },

    // 🍰 甜點
    { url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800", keywords: ["甜點", "蛋糕", "巧克力", "chocolate"], category: "fruit" },
    { url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800", keywords: ["冰淇淋", "ice cream", "雪糕", "甜品"], category: "fruit" },
    { url: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=800", keywords: ["布丁", "奶酪", "pudding", "果凍"], category: "fruit" },
    { url: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=800", keywords: ["班戟", "crepe", "薄餅", "法式薄餅"], category: "mixed" },

    // 🍵 飲品/湯品
    { url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800", keywords: ["珍珠奶茶", "bubble tea", "奶茶", "手搖"], category: "soup" },
    { url: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?q=80&w=800", keywords: ["西式湯", "cream soup", "奶油濃湯", "南瓜湯"], category: "soup" },
    { url: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800", keywords: ["藥膳", "中式湯", "燉品", "蔘雞"], category: "soup" },
    { url: "https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=800", keywords: ["羅宋湯", "蔬菜湯", "西式燉湯", "牛肉湯"], category: "soup" },
];


/**
 * 根據食譜名稱、食材和類別，智能選擇最相關的示意圖
 */
export function getRecipeImage(
    recipeName: string,
    ingredients: string[],
    category: string
): string {
    const searchText = `${recipeName} ${ingredients.join(" ")}`.toLowerCase();

    // 計算每張圖片的匹配分數
    let bestMatch = RECIPE_IMAGE_LIBRARY[0];
    let bestScore = 0;

    for (const img of RECIPE_IMAGE_LIBRARY) {
        let score = 0;

        // 類別比對 (權重高)
        if (img.category === category) score += 5;

        // 關鍵字比對
        for (const keyword of img.keywords) {
            if (searchText.includes(keyword.toLowerCase())) {
                score += 3;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = img;
        }
    }

    // 如果完全沒有匹配，根據 category 選一個隨機同類圖片
    if (bestScore === 0) {
        const categoryImages = RECIPE_IMAGE_LIBRARY.filter(img => img.category === category);
        if (categoryImages.length > 0) {
            return categoryImages[Math.floor(Math.random() * categoryImages.length)].url;
        }
        // 最後保底：隨機選一張
        return RECIPE_IMAGE_LIBRARY[Math.floor(Math.random() * RECIPE_IMAGE_LIBRARY.length)].url;
    }

    return bestMatch.url;
}
