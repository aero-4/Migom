import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import config from "../../config.ts";
import MiniCard from "../components/Ui/MiniCard.tsx";
import NotFound from "./NotFound.tsx";
import Loader from "../components/Loaders/Loader.tsx";

export default function Courier() {
    const { user } = useAuth();
    const [activeOrder, setActiveOrder] = useState(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${config.API_URL}/api/orders/search`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ status: ["waiting-courier"] }),
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

    useEffect(() => {
        const fetchActiveOrder = async () => {
            if (!user) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${config.API_URL}/api/orders/current`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ status: "delivering"}),
                });

                const order = await response.json();
                setActiveOrder(order);

                setOrders((prev) => prev.filter((o) => o.id !== order.id));

                setSelectedOrderId(null);
            } catch (err: any) {
                console.error("takeOrder error", err);
                setError(err.message || "Не удалось взять заказ");
            } finally {
                setIsLoading(false);
            }
        }
        fetchActiveOrder()
    }, []);


    const takeOrder = async (order: any) => {
        if (!user) return;

        if (activeOrder) {
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
                body: JSON.stringify({ status: "delivering"}),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Ошибка при взятии заказа: ${response.status} ${text}`);
            }

            const updated = await response.json();
            setActiveOrder(updated);

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
    if (isLoading) return <Loader/>;

    return (
        <>
            {activeOrder && (
                <div className="">
                    <p>У вас в работе заказ №{activeOrder}. Завершите или отмените его, чтобы взять новый.</p>
                </div>
            )}

            <div className="p-4">
                <h2 className="title">Заказы на доставку</h2>

                {isLoading && <p className="text-sm text-gray-500 mb-2">Загрузка...</p>}
                {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

                <div
                    ref={containerRef}
                    className="flex flex-col gap-4 overflow-x-auto snap-x snap-mandatory py-2 px-1"
                    tabIndex={0}
                >
                    {orders.length === 0 && !isLoading && <p className="text-gray-500">Нет доступных заказов</p>}

                    {orders.map((order) => {
                        return (
                            <div
                                key={order.id}
                                className={`flex flex-col card shadow p-9`}
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

                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2 overflow-hidden">
                                        {order.products?.slice(0, 3).map((p: any, idx: number) => (
                                            <div key={idx} className="w-20 h-20 rounded flex items-center justify-center">
                                                <MiniCard product={p} />
                                            </div>
                                        ))}

                                        {order.products && order.products.length > 3 && (
                                            <div className="flex items-center justify-center w-20 h-20 rounded text-sm">+{order.products.length - 3}</div>
                                        )}
                                    </div>

                                </div>

                                <div className="flex gap-2 mt-auto">
                                    <button
                                        onClick={() => takeOrder(order)}
                                        className={`big__button`}
                                    >
                                        Взять заказ
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>
        </>

    );
}
