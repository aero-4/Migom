import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import config from "../../config.ts";
import MiniCard from "../components/Ui/MiniCard.tsx";
import NotFound from "./NotFound.tsx";

/**
 * Обновлённый компонент Courier
 * - Горизонтальная прокручиваемая (swipe) лента карточек с "snap".
 * - Можно выбрать карточку (визуально) и нажать кнопку "Взять заказ".
 * - Быстрая кнопка "Быстро взять" на карточке для мгновенного PATCH-запроса.
 * - PATCH-запрос отправляется на: /api/orders/{id} (метод PATCH). Тело запроса: { action: "take", courier_id: user.id }
 *   -> **Важно**: бекенд может ожидать другое тело (например { status: 'delivering' } или { assignee: user.id }). Если нужно — поменяйте payload в takeOrder().
 * - Курьер может иметь только один активный заказ: активный заказ блокирует "взять" для остальных.
 * - Удаляем/обновляем заказ в списке при успешном взятии.
 *
 * Примечание про загрузку заказов: для поиска используется POST /api/orders/search с телом { status: [...] }.
 * Если ваш API требует GET с query-параметрами — подправьте fetchOrders()
 */

export default function Courier() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // initial load
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${config.API_URL}/api/orders/search`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ status: ["waiting", "pending", "cooking", "delivering", "waiting-courier"] }),
                });

                if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
                const data = await response.json();
                setOrders(Array.isArray(data) ? data : []);
                setError(null);
            } catch (err: any) {
                console.error("Error fetching orders:", err);
                setError(err.message || "Не удалось загрузить заказы");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const scroll = (delta: number) => {
        if (!containerRef.current) return;
        containerRef.current.scrollBy({ left: delta, behavior: "smooth" });
    };

    const takeOrder = async (order: any) => {
        if (!user) return;
        if (activeOrderId) {
            setError("У вас уже есть активный заказ. Завершите его прежде чем брать новый.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${config.API_URL}/api/orders/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action: "take", courier_id: user.id }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Ошибка при взятии заказа: ${response.status} ${text}`);
            }

            const updated = await response.json();
            setActiveOrderId(order.id);

            setOrders((prev) => prev.filter((o) => o.id !== order.id));

            setSelectedOrderId(null);
        } catch (err: any) {
            console.error("takeOrder error", err);
            setError(err.message || "Не удалось взять заказ");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;
    if (user.role < 2) return <NotFound />;

    return (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl">Доступные заказы</h2>
                <div className="ml-auto flex items-center gap-3">
                    <button onClick={() => scroll(-400)} className="p-2 rounded-full hover:bg-gray-100" aria-label="scroll-left">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L10 16L20 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M11 16H26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </button>

                    <button onClick={() => scroll(400)} className="p-2 rounded-full hover:bg-gray-100" aria-label="scroll-right">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 6L22 16L12 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 16H21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>

            {isLoading && <p className="text-sm text-gray-500 mb-2">Загрузка...</p>}
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

            {activeOrderId && (
                <div className="mt-4 p-3 bg-yellow-50 border rounded">
                    <p>У вас в работе заказ №{activeOrderId}. Завершите или отмените его, чтобы взять новый.</p>
                </div>
            )}

            <div
                ref={containerRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 px-1"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") scroll(-300);
                    if (e.key === "ArrowRight") scroll(300);
                }}
            >
                {orders.length === 0 && !isLoading && <p className="text-gray-500">Нет доступных заказов</p>}

                {orders.map((order) => {
                    const isSelected = selectedOrderId === order.id;
                    const isTaken = activeOrderId === order.id;

                    return (
                        <div
                            key={order.id}
                            className={`min-w-[320px] snap-center bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex-shrink-0 transition-transform duration-200 transform ${
                                isSelected ? "scale-105 ring-4 ring-indigo-200" : "hover:scale-102"
                            }`}
                        >
                            <div className="flex items-center mb-2">
                                <div>
                                    <h3 className="text-lg font-semibold">Заказ №{order.id}</h3>
                                    <p className="text-sm text-gray-400">от {new Date(order.created_at).toLocaleString()}</p>
                                </div>

                                <div className="ml-auto text-right">
                                    <p className="text-xl font-bold">{order.amount} ₽</p>
                                </div>
                            </div>

                            <div className="mb-3 flex flex-col gap-2">
                                {/* Render quick product preview(s) */}
                                <div className="flex gap-2 overflow-hidden">
                                    {order.products?.slice(0, 3).map((p: any, idx: number) => (
                                        <div key={idx} className="flex-shrink-0 w-20 h-20 border rounded p-1 flex items-center justify-center">
                                            <MiniCard product={p} />
                                        </div>
                                    ))}
                                    {order.products && order.products.length > 3 && (
                                        <div className="flex items-center justify-center w-20 h-20 border rounded text-sm">+{order.products.length - 3}</div>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600">Статус: {order.status || "—"}</p>
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => setSelectedOrderId(isSelected ? null : order.id)}
                                    className={`flex-1 px-3 py-2 rounded-lg border ${
                                        isSelected ? "bg-indigo-600 text-white" : "bg-white"
                                    }`}
                                >
                                    {isSelected ? "Выбрано" : "Выбрать"}
                                </button>

                                <button
                                    onClick={() => takeOrder(order)}
                                    disabled={!!activeOrderId || isTaken || isLoading}
                                    className={`px-4 py-2 rounded-lg text-white ${
                                        activeOrderId || isTaken ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:opacity-90"
                                    }`}
                                >
                                    Взять заказ
                                </button>
                            </div>

                            {/* Быстрая SVG-кнопка (в правом верхнем углу) */}
                            <button
                                title="Быстро взять"
                                onClick={() => takeOrder(order)}
                                disabled={!!activeOrderId || isTaken || isLoading}
                                className="absolute"
                                style={{ right: 16, top: 16 }}
                            >
                                <svg
                                    width="36"
                                    height="36"
                                    viewBox="0 0 36 36"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`rounded-full p-2 transition ${activeOrderId ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"}`}
                                >
                                    <path
                                        d="M19.5 2L8 20h7l-1.5 14L26 14h-7l.5-12z"
                                        fill="white"
                                    />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
