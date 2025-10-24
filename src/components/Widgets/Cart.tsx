import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import cartSvg from "../../assets/cart.svg"; // если не используешь — можно удалить

export const CartWidget: React.FC = () => {
    const { items, totalItems, totalPrice, isOpen, open, close, toggle, setQty, removeItem, clear, createOrder } = useCart();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (items.length === 0) {
            alert("Корзина пуста");
            return;
        }
        setLoading(true);
        // Можно передать meta (адрес, телефон) — пока пустой объект
        const result = await createOrder({ source: "web" });
        setLoading(false);

        if (result.ok) {
            // Успех — очищаем корзину и показываем подтверждение
            clear();
            close();
            alert("Заказ отправлен успешно! Номер: " + (result.data?.orderId ?? "—"));
        } else {
            alert("Ошибка при оформлении заказа: " + (result.error ?? "unknown"));
        }
    };

    return (
        <>
            {/* Floating button */}
            <button
                aria-label="Cart"
                onClick={toggle}
                className="fixed right-6 bottom-6 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none"
            >
                {/* svg (attributes in React must be camelCase) */}
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000">
                    <g id="SVGRepo_iconCarrier">
                        <path
                            d="M15 11C15 12.6569 13.6569 14 12 14C10.3431 14 9 12.6569 9 11M4 7H20M4 7V13C4 19.3668 5.12797 20.5 12 20.5C18.872 20.5 20 19.3668 20 13V7M4 7L5.44721 4.10557C5.786 3.428 6.47852 3 7.23607 3H16.7639C17.5215 3 18.214 3.428 18.5528 4.10557L20 7"
                            stroke="#ffffff"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </g>
                </svg>

                {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
            {totalItems}
          </span>
                )}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div onClick={close} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" aria-hidden />
            )}

            {/* Drawer */}
            <aside
                className={`fixed top-0 right-0 z-50 h-full w-full max-w-md transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Корзина</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={clear} className="text-sm text-gray-500 hover:text-gray-700">
                            Очистить
                        </button>
                        <button onClick={close} aria-label="Close" className="p-2 rounded hover:bg-gray-100">
                            ✕
                        </button>
                    </div>
                </div>

                <div className="text-base p-4 flex flex-col gap-4 h-[calc(100%-160px)] overflow-auto">
                    {items.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">Пока пусто.</div>
                    ) : (
                        items.map((it) => (
                            <div key={it.id} className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                    {it.image ? (
                                        <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-xs text-gray-400">NO IMAGE</div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="font-medium">{it.name}</div>
                                    <div className="text-sm text-gray-500">{it.price.toLocaleString()} ₽</div>

                                    <div className="mt-2 flex items-center gap-2">
                                        <button
                                            onClick={() => setQty(it.id, it.qty - 1)}
                                            className="px-2 py-1 rounded border"
                                            aria-label="Decrease"
                                        >
                                            −
                                        </button>
                                        <div className="px-3 py-1 border rounded">{it.qty}</div>
                                        <button
                                            onClick={() => setQty(it.id, it.qty + 1)}
                                            className="px-2 py-1 rounded border"
                                            aria-label="Increase"
                                        >
                                            +
                                        </button>

                                        <button onClick={() => removeItem(it.id)} className="ml-3 text-sm text-red-500">
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-gray-600">Итого ({totalItems} шт)</div>
                        <div className="text-lg font-semibold">{totalPrice.toLocaleString()} ₽</div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className={`flex-1 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
                        >
                            {loading ? "Отправка..." : "Оформить заказ"}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};
