import React from "react";
import { useInventoryStore, ScannedItem, WasteRecord } from "./inventoryStore";

/**
 * 狀態管理遷移 (State Management Migration)
 * 本模組已從 React Context 遷移至 Zustand。
 * 為了保持與舊組件的相容性，這裡保留了 useIngredients 勾子名稱，
 * 但內部實作已改為直接連接 Zustand Store。
 */

export { type ScannedItem, type WasteRecord };

export const useIngredients = useInventoryStore;

/**
 * 容器組件 (Provider Bridge)
 * 現已不再需要實際的 Provider，僅返回 children。
 */
export function IngredientProvider({ children }: { children: React.ReactNode }) {
    // 您可以在這裡保留一些副作用，例如全域的通知檢查
    const checkNotifications = useInventoryStore(state => state.checkNotifications);
    
    React.useEffect(() => {
        const timer = setTimeout(() => {
            checkNotifications();
        }, 3000);
        return () => clearTimeout(timer);
    }, [checkNotifications]);

    return <>{children}</>;
}
