import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import config from "../../config.ts";

export type Product = {
    id: string | number;
    name: string;
    price: number;
    discount_price: number;
    image?: string;
};

export type CartItem = Product & { qty: number };

type CartContextType = {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    addItem: (product: Product, qty?: number) => void;
    removeItem: (id: Product["id"]) => void;
    setQty: (id: Product["id"], qty: number) => void;
    clear: () => void;
    createOrder: (payload: Record<string, any>) => Promise<{ ok: boolean; data?: any; error?: string }>;
    createPayment: (payload: Record<string, any>) => Promise<{ ok: boolean; data?: any; error?: string }>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "cart_v1";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw) as CartItem[]) : [];
        } catch {
            return [];
        }
    });

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            console.error("Can't save cart", e);
        }
    }, [items]);

    const addItem = (product: Product, qty = 1) => {
        setItems((prev) => {
            const idx = prev.findIndex((p) => p.id === product.id);
            if (idx === -1) {
                return [...prev, {...product, qty}];
            } else {
                const copy = [...prev];
                copy[idx] = {...copy[idx], qty: copy[idx].qty + qty};
                return copy;
            }
        });
    };

    const removeItem = (id: Product["id"]) => {
        setItems((prev) => prev.filter((p) => p.id !== id));
    };

    const setQty = (id: Product["id"], delta: number) => {
        setItems(prev => {
            const item = prev.find(p => p.id === id);
            if (!item) return prev;

            const newQty = item.qty + delta;

            if (newQty <= 0) {
                return prev.filter(p => p.id !== id);
            }

            return prev.map(p =>
                p.id === id ? { ...p, qty: newQty } : p
            );
        });
    };


    const clear = () => setItems([]);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    const toggle = () => setIsOpen((s) => !s);

    const totalItems = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
    const totalPrice = useMemo(() => items.reduce((s, i) => s + i.qty * (i.discount_price ?? i.price), 0), [items]);

    const createOrder = async (payload: Record<string, any>) => {
        try {
            const res = await fetch(config.API_URL + "/api/orders/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
                credentials: "include"
            });
            if (!res.ok) {
                const text = await res.text();
                let parsed: any = text;
                try {
                    parsed = JSON.parse(text);
                } catch { /* не JSON */
                }
                const errMsg = (parsed && parsed.detail) ? parsed.detail : (text || `Status ${res.status}`);
                return {ok: false, error: errMsg};
            }
            const data = await res.json();
            return {ok: true, data};
        } catch (err: any) {
            return {ok: false, error: err?.message ?? "Network error"};
        }
    };

    const createPayment = async (payload: Record<string, any>) => {
        try {
            const res = await fetch(config.API_URL + "/api/payments/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
                credentials: "include"
            });
            if (!res.ok) {
                const text = await res.text();
                let parsed: any = text;
                try {
                    parsed = JSON.parse(text);
                } catch { /* не JSON */
                }
                const errMsg = (parsed && parsed.detail) ? parsed.detail : (text || `Status ${res.status}`);
                return {ok: false, error: errMsg};
            }
            const data = await res.json();
            return {ok: true, data};
        } catch (err: any) {
            return {ok: false, error: err?.message ?? "Network error"};
        }
    }

    return (
        <CartContext.Provider
            value={{items, totalItems, totalPrice, isOpen, open, close, toggle, addItem, removeItem, setQty, clear, createOrder, createPayment}}
        >
            {children}
        </CartContext.Provider>
    );
};

export function useCart(): CartContextType {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
