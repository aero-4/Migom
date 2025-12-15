import React, { useEffect, useState } from "react";
import config from "../../config.ts";
import Loader from "../components/Loaders/Loader.tsx";

const statusMap: Record<
    string,
    { text: string; color: string }
> = {
    created: { text: "Создан", color: "bg-gray-500" },
    pending: { text: "Ищем курьера...", color: "bg-yellow-500" },
    delivering: { text: "В доставке", color: "bg-orange-500" },
    success: { text: "Успешно", color: "bg-green-500" },
    error: { text: "Проблема", color: "bg-red-500" },
};

interface Order {
    id: number;
    amount: number;
    status: string;
    created_at: string;
}

function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${config.API_URL}/api/orders/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`Ошибка загрузки: ${response.status}`);
                }

                const data: Order[] = await response.json();
                setOrders(data);
                setError(null);
            } catch (err: any) {
                console.error("Error fetching orders:", err);
                setError(err.message || "Не удалось загрузить заказы");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <p className="text-center text-red-500 mt-4">
                {error}
            </p>
        );
    }

    return (
        <>
            <h2 className="title">Последние ваши заказы</h2>

            <div className="card min-h-screen">
                {orders.length === 0 ? (
                    <p className="text-center text-gray-400">
                        Тут ничего нет.
                    </p>
                ) : (
                    <div className="flex flex-col gap-4 md:gap-8">
                        {orders.map((order) => {
                            const status = statusMap[order.status];

                            return (
                                <div
                                    key={order.id}
                                    className="card shadow gap-3"
                                >
                                    <div className="flex flex-row items-center">
                                        <h3 className="text-xl">
                                            Заказ №{order.id}
                                        </h3>

                                        <p className="text-xl font-bold ml-auto">
                                            {order.amount} ₽
                                        </p>
                                    </div>

                                    <div className="flex flex-row items-center">
                                        <p className="text-sm text-gray-400">
                                            от {new Date(order.created_at).toLocaleString()}
                                        </p>

                                        <div className="ml-auto flex items-center gap-1 ">
                                            <span
                                                className={`inline-block w-3 h-3 rounded-full ${status?.color}`}
                                            />
                                            <p className="text-lg ">
                                                {status?.text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

export default Orders;