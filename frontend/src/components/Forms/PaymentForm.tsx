import React, { useEffect, useRef, useState } from "react";
import type { DeliveryAddress } from "./DeliveryForm";
import BackButton from "../Ui/BackButton";
import successGif from "../../assets/success.gif";
import config from "../../../config";

type PaymentStatus = "waiting" | "success" | "expired" | null;

type PaymentFormProps = {
    address: DeliveryAddress;
    onSubmit?: (addr: DeliveryAddress) => Promise<number>;
    onBack?: () => void;
};

const POLL_INTERVAL = 3000;

const PaymentForm: React.FC<PaymentFormProps> = ({
                                                     address,
                                                     onSubmit,
                                                     onBack,
                                                 }) => {
    const [paymentId, setPaymentId] = useState<number | null>(null);
    const [url, setUrl] = useState(null)
    const [status, setStatus] = useState<PaymentStatus>(null);
    const intervalRef = useRef<number | null>(null);

    const handlePayment = async () => {
        const {id, url} = await onSubmit?.(address);
        if (!id) return;

        setUrl(url)
        setPaymentId(id);
        setStatus("waiting");
    };

    const checkPaymentStatus = async () => {
        if (!paymentId) return;

        try {
            const res = await fetch(
                `${config.API_URL}/api/payments/${paymentId}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );

            if (!res.ok) return;

            const data = await res.json();
            const newStatus = data.status as PaymentStatus;

            setStatus(newStatus);

            if (newStatus === "success" || newStatus === "expired") {
                stopPolling();
            }
        } catch (e) {
            console.error("Payment status error", e);
        }
    };

    const startPolling = () => {
        stopPolling();
        intervalRef.current = window.setInterval(
            checkPaymentStatus,
            POLL_INTERVAL
        );
    };

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        if (!paymentId) return;

        checkPaymentStatus();
        startPolling();

        return stopPolling;
    }, [paymentId]);

    return (
        <div className="flex flex-col p-3 min-h-screen">
            <h3 className="text-3xl font-semibold my-6">Оплата</h3>

            <div className="flex flex-col gap-2 text-center mt-auto ">
                {!paymentId && (
                    <button
                        type="button"
                        onClick={handlePayment}
                        className="btn__circle big__button bg-violet-500"
                    >
                        Оплатить через ЮМани
                    </button>
                )}

                {status === "waiting" && (
                    <>
                        <h1 className="title">Ищем вашу оплату…</h1>
                        <button className="big__button btn__circle" onClick={() => window.open(url, "_blank", "noopener,noreferrer")}>Открыть ссылку</button>
                    </>
                )}

                {status === "success" && (
                    <>
                        <img
                            src={successGif}
                            alt="Успешно"
                            className="mx-auto w-40"
                        />
                        <h1 className="title text-green-600">Оплачено</h1>
                    </>
                )}

                {status === "expired" && (
                    <>
                        <h1 className="title text-red-500">
                            Время оплаты истекло
                        </h1>
                        <button
                            onClick={handlePayment}
                            className="btn__circle big__button bg-violet-500"
                        >
                            Попробовать снова
                        </button>
                    </>
                )}

                {onBack && status !== "success" && (
                    <BackButton onBack={onBack} />
                )}
            </div>
        </div>
    );
};

export default PaymentForm;
