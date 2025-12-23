import React, {use, useRef, useState} from "react";
import OpenButton from "../Ui/OpenButton.tsx";
import MiniCard from "../Ui/MiniCard.tsx";
import MapToPlace from "../Ui/Map.tsx";
import copySvg from "../../assets/copy-icon.svg";
import config from "../../../config.ts";
import ActionModal from "./Action.tsx";

const ActiveOrderCook = ({order}) => {
    const [isOpen, setIsOpen] = useState(false)
    const modalRef = useRef<HTMLDivElement | null>(null);

    const setStatusSuccess = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/orders/${order.id}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({status: "waiting-courier"}),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Ошибка при смены статуса заказа: ${response.status} ${text}`);
            }

            await response.json();

            location.assign("/cook")

        } catch (err: any) {
            console.error("takeOrder error", err);
        }
    };
    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="relative w-full h-full bg-white shadow-lg overflow-auto p-2">

                <div className="flex flex-col gap-2">
                    <h1 className="title">Приготовьте заказ</h1>

                    <div
                        key={order.id}
                        className="card gap-12 shadow border-1 border-gray-200"
                    >
                        <div className="flex flex-row gap-1 items-center">
                            <h1 className="text-xl font-medium text-gray-800">Информация о заказе</h1>

                            <p className="text-xl font-bold ml-auto">
                                {order.amount} ₽
                            </p>
                        </div>

                        <OpenButton elements={order.products.map((product) => (
                            <div className="flex flex-col gap-3">
                                <MiniCard product={product}/>
                            </div>
                        ))}/>
                        <div className="flex flex-row gap-3 items-center">
                            <p className="text-sm text-gray-300">
                                создан {new Date(order.created_at).toLocaleString()}
                            </p>

                            <button className="ml-auto big__button flex bg-green-100 text-green-600"
                                    onClick={() => setIsOpen(true)}>

                                <svg className="w-4" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision"
                                     text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd"
                                     clip-rule="evenodd" viewBox="0 0 512 444.81">
                                    <path fill="#009800" fill-rule="nonzero"
                                          d="M104.42 183.22c31.76 18.29 52.42 33.49 77.03 60.61C245.27 141.11 314.54 84.19 404.62 3.4l8.81-3.4H512C379.83 146.79 277.36 267.82 185.61 444.81 137.84 342.68 95.26 272.18 0 206.81l104.42-23.59z"/>
                                </svg>

                                Заказ готов

                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ActionModal isOpen={isOpen}
                         onConfirm={setStatusSuccess}
                         onClose={() => setIsOpen(false)}
                         message="Вы уверены? В случае если заказ не был приготовлен вы получите штраф в 25% от стоимости заказа"
            />
        </div>


    );
};
export default ActiveOrderCook;