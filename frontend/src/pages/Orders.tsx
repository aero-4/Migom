import React, {useEffect, useState} from "react";
import config from "../../config.ts";
import Loader from "../components/Loaders/Loader.tsx";
import OpenButton from "../components/Ui/OpenButton.tsx";
import MiniCard from "../components/Ui/MiniCard.tsx";

const statusMap: Record<
    string,
    { text: string; color: string }
> = {
    "created": {text: "Создан", color: "bg-gray-300"},
    "pending": {text: "Оплачен, ждем подтверждения", color: "bg-blue-300"},
    "cooking": {text: "Готовится", color: "bg-brown-300"},
    "waiting-courier": {text: "Ищем курьера", color: "bg-yellow-300"},
    "delivering": {text: "В доставке", color: "bg-orange-300"},
    "success": {text: "Успешно доставлен", color: "bg-green-400"},
    "error": {text: "Проблема", color: "bg-red-300"},
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
        return <Loader/>;
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
            <h2 className="title">Последние заказы</h2>

            <div className="container min-h-screen">
                {orders.length === 0 ? (
                    <div className="flex flex-col gap-7">
                        <p className="text-center text-gray-700">
                            Пустота! Но Вы можете все поменять сделав первый заказ!
                        </p>
                        <button className="big__button full__button" onClick={() => window.location.assign("/")}>Поглядеть товары</button>
                    </div>

                ) : (
                    <div className="flex flex-col gap-4 md:gap-6">
                        {orders.map((order) => {
                            const status = statusMap[order.status];

                            return (
                                <div
                                    key={order.id}
                                    className="card gap-3 shadow border-1 border-gray-100"
                                >
                                    <div className="flex items-center">

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

                                    <OpenButton className="mx-auto justify-center" elements={order.products.map((product) => (
                                        <MiniCard product={product}/>
                                    ))}/>
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