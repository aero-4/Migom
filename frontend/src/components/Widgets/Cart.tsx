import React, {useCallback, useEffect, useRef, useState} from "react";
import {useCart} from "../../context/CartContext";
import QuantityInput from "../Ui/QuantityInput.tsx";
import CloseButton from "../Ui/CloseButton.tsx";
import {useAuth} from "../../context/AuthContext.tsx";
import PaymentForm from "../Forms/PaymentForm.tsx";
import {DeliveryForm} from "../Forms/DeliveryForm.tsx";

export type DeliveryAddress = {
    id?: number | string;
    addressLine?: string;
    street?: string;
    house?: string;
    flat?: string;
    floor?: string;
    intercom?: string;
    comment?: string;
    leaveAtDoor?: boolean;
};

type Step = "cart" | "address" | "payment";

export const CartWidget: React.FC = () => {
    const {
        items,
        totalItems,
        totalPrice,
        isOpen,
        close,
        toggle,
        setQty,
        removeItem,
        clear,
        createOrder,
        createPayment
    } = useCart();
    const {isAuthenticated} = useAuth();
    const [loading, setLoading] = useState(false);
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const [step, setStep] = useState<Step>("cart");

    const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    const fetchAddresses = useCallback(
        async (signal?: AbortSignal) => {
            if (loadingAddresses) return;

            setLoadingAddresses(true);

            try {
                const res = await fetch("/api/addresses/", {signal});

                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        window.location.assign("/login");
                    }
                    setAddresses([]);
                    return;
                }

                const list = await res.json();
                if (!Array.isArray(list)) {
                    setAddresses([]);
                    return;
                }

                const mapped: DeliveryAddress[] = list.map((last: any) => ({
                    id: last.id,
                    addressLine: last.city ?? "",
                    street: last.street ?? "",
                    house: last.house_number != null ? String(last.house_number) : "",
                    flat: last.apartment_number != null ? String(last.apartment_number) : "",
                    floor: last.floor != null ? String(last.floor) : "",
                    intercom: last.entrance != null ? String(last.entrance) : "",
                    comment: last.comment ?? "",
                    leaveAtDoor: !!last.is_leave_at_door,
                }));

                setAddresses(prev => {
                    if (
                        prev.length === mapped.length &&
                        prev.every((a, i) => a.id === mapped[i].id)
                    ) {
                        return prev;
                    }
                    return mapped;
                });

                if (!selectedAddress && mapped.length > 0) {
                    setSelectedAddress(mapped[0]);
                }
            } catch (e) {
                if ((e as any)?.name === "AbortError") return;
                console.error("Failed to fetch addresses", e);
                setAddresses([]);
            } finally {
                setLoadingAddresses(false);
            }
        },
        [loadingAddresses, selectedAddress]
    );


    useEffect(() => {
        let timer: number | undefined;
        if (isOpen) {
            document.body.style.overflow = "hidden";
            timer = window.setTimeout(() => closeButtonRef.current?.focus(), 120);
        } else {
            document.body.style.overflow = "";
            triggerRef.current?.focus();
        }
        return () => {
            document.body.style.overflow = "";
            if (timer) clearTimeout(timer);
        };
    }, [isOpen]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) handleClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen]);

    const handleClose = () => {
        setStep("cart");
        close();
    };

    const handleSwitchToDeliveringForm = () => {
        if (addresses.length > 0) {
            setSelectedAddress(addresses[0]);
        }
        setStep("address");
    };

    const handleCheckout = async (addr?: DeliveryAddress | null) => {
        if (items.length === 0) {
            alert("Корзина пуста");
            return;
        }

        const chosen = addr ?? selectedAddress;
        const addressId = chosen?.id ?? null;
        if (!addressId) {
            alert("Пожалуйста, выберите или сохраните адрес доставки.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                address_id: Number(addressId),
                products: items.map(it => ({product_id: Number(it.id), quantity: Number(it.qty)}))
            };
            const result = await createOrder(payload);

            if (result.ok) {
                const orderId = result.data?.order?.id ?? result.data?.id ?? result.data?.orderId;
                if (orderId) {
                    const result2 = await createPayment({order_id: orderId, amount: totalPrice, method: "yoomoney"})

                    if (result2.ok) {
                        const url = result2.data?.url

                        if (url) {
                            window.open(url, "_blank", "noopener,noreferrer");

                            return result2.data

                        } else {
                            console.error("No payment url:", result2.data);
                        }
                    } else {
                        console.error("Payment create error:", result2.error);
                    }
                } else {
                    console.error("No order id in response:", result.data);
                }
            } else {
                console.error("Order create error:", result.error);
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <button
                type="button"
                ref={triggerRef}
                aria-label="Открыть корзину"
                onClick={toggle}
                className="menu__button"
            >
                {totalItems > 0 && (
                    <span
                        className="absolute justify-center p-1 px-1 text-sm -mt-2 ml-5 font-semibold leading-none text-white bg-red-500 rounded-full shadow"
                        aria-live="polite"
                    >
                        {totalItems}
                    </span>
                )}

                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                        d="M15 11C15 12.6569 13.6569 14 12 14C10.3431 14 9 12.6569 9 11M4 7H20M4 7V13C4 19.3668 5.12797 20.5 12 20.5C18.872 20.5 20 19.3668 20 13V7M4 7L5.44721 4.10557C5.786 3.428 6.47852 3 7.23607 3H16.7639C17.5215 3 18.214 3.428 18.5528 4.10557L20 7"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            <div className={`fixed inset-0 z-100 ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden>
                <div
                    onClick={handleClose}
                    className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                />

                <aside
                    onClick={(e) => e.stopPropagation()}
                    className={`h-full w-full md:p-6 xl:max-w-160 2xl:max-w-220 fixed top-0 right-0 z-50 transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${
                        isOpen ? "translate-x-0" : "translate-x-full"
                    } md:rounded-l-3xl  overflow-hidden`}
                    role="dialog"
                    aria-modal="true"
                >
                    {step === "cart" && (
                        <div className="h-full w-full flex flex-col">
                            <div className="w-full flex flex-col min-h-0">
                                <div className="flex items-center justify-between p-3">
                                    <h3 id="cart-title" className="text-2xl font-semibold text-gray-800">
                                        Корзина
                                    </h3>

                                    <div className="flex items-center gap-3">
                                        <CloseButton close={handleClose}/>
                                    </div>
                                </div>

                                <div className="overflow-y-auto">
                                    {items.length === 0 ? (
                                        <div className="flex flex-col my-auto text-center items-center justify-center text-gray-600">
                                            <div className="text-3xl font-medium">Корзина пуста</div>

                                            <div className="text-sm mt-2">Добавьте товары и они появятся тут</div>
                                        </div>
                                    ) : (
                                        <ul className="space-y-5 w-full p-3">
                                            {items.map((item) => (
                                                <li key={item.id}
                                                    className="flex gap-3 items-start p-2 md:p-6 rounded-lg border border-gray-100">
                                                    <div
                                                        className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                                                        {item.image ? (
                                                            <img src={item.image}
                                                                 alt={item.name}
                                                                 className="w-full h-full object-cover cursor-pointer"
                                                                 onClick={() => document.location.href = "/product/" + item.id}
                                                            />
                                                        ) : (
                                                            <div className="text-xs text-gray-400">
                                                                PHOTO
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0 ">
                                                        <div className="flex flex-row items-start justify-between gap-3">
                                                            <div className="font-medium text-gray-800 truncate">
                                                                {item.name}
                                                                <p className="text-gray-500 text-sm">{item.grams} г</p>

                                                            </div>

                                                        </div>

                                                        <div className="mt-4 flex items-center gap-3">
                                                            <QuantityInput item={item}
                                                                           setQty={setQty}
                                                                           />
                                                            <div className="ml-auto text-lg text-gray-600">
                                                                <span className="font-semibold text-gray-800">
                                                                    {item.discount_price ? item.discount_price : item.price} ₽
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col">
                                <div className="p-3 flex flex-col">

                                    <div className="mb-6 flex flex-row items-center justify-center w-full">
                                        <div className="text-gray-600 p-3">К оплате:</div>
                                        <div className="justify-center font-bold text-2xl md:text-3xl text-gray-900">
                                            {totalPrice.toLocaleString()} ₽
                                        </div>
                                    </div>

                                    <div className="flex flex-row gap-1">
                                        <button
                                            type="button"
                                            onClick={clear}
                                            disabled={items.length === 0}
                                            className="big__button btn__circle bg-gray-400"
                                        >
                                            Очистить корзину
                                        </button>

                                        {isAuthenticated ? (
                                            <button
                                                type="button"
                                                onClick={handleSwitchToDeliveringForm}
                                                disabled={loading || items.length === 0}
                                                className={`big__button btn__circle ${
                                                    loading || items.length === 0 ? "cursor-not-allowed" : "bg-red-600"
                                                } focus:outline-none`}
                                            >
                                                Оформить заказ
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => window.location.assign("/login")}
                                                disabled={loading || items.length === 0}
                                                className={`big__button btn__circle ${
                                                    loading || items.length === 0 ? "cursor-not-allowed" : "bg-red-600"
                                                } focus:outline-none`}
                                            >
                                                Оформить заказ и войти
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "address" && (
                        <DeliveryForm
                            addresses={addresses}
                            fetchAddresses={fetchAddresses}
                            selectedAddress={selectedAddress}
                            setSelectedAddress={setSelectedAddress}
                            onSaved={(addr) => {
                                setSelectedAddress(addr);
                                setStep("payment");
                            }}
                            onBack={() => setStep("cart")}
                            onClose={close}
                        />
                    )}

                    {step === "payment" && (
                        <PaymentForm
                            address={selectedAddress}
                            onSubmit={() => handleCheckout(selectedAddress)}
                            onBack={() => setStep("address")}
                        />
                    )}

                </aside>
            </div>
        </>
    );
};

export default CartWidget;
