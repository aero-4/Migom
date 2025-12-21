import React, {use, useRef, useState} from "react";
import OpenButton from "../Ui/OpenButton.tsx";
import MiniCard from "../Ui/MiniCard.tsx";
import MapToPlace from "../Ui/Map.tsx";
import copySvg from "../../assets/copy-icon.svg";
import config from "../../../config.ts";
import ActionModal from "./Action.tsx";

const ActiveOrder = ({order}) => {
    const [isOpen, setIsOpen] = useState(false)
    const modalRef = useRef<HTMLDivElement | null>(null);
    const fullAddress =  `${order.address.city ? `г. ${order.address.city}` : ""} ${order.address.street ? `ул. ${order.address.street}` : ""} ${order.address.house_number ? `д. ${order.address.house_number}` : ""} ${order.address.flat ? "Кв. ${order.address.flat}" : ""} ${order.address.floor ? `этаж: ${order.address.floor}` : ""} ${order.address.intercom ? ` домофон: ${order.address.intercom}` : ""}`;

    const setStatusSuccess = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/orders/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: "success"}),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Ошибка при смены статуса заказа: ${response.status} ${text}`);
            }

            await response.json();

            location.assign("/courier")

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
                className="relative w-full h-full bg-white md:h-auto shadow-lg overflow-auto p-1">

                <div className="flex flex-col gap-2">
                    <h1 className="title">Доставьте заказ</h1>

                    <MapToPlace destinationAddress={fullAddress}/>

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


                        <div className="flex flex-col gap-3">

                            <div className="flex-1 flex flex-col gap-1">
                                <div className="flex flex-row gap-1">
                                    <div className="flex flex-1 flex-row gap-3 items-center badge">
                                        <span className="text-gray-500">{fullAddress}</span>
                                    </div>
                                    <button className="big__button"
                                            onClick={() => navigator.clipboard.writeText(fullAddress)}>
                                        <img src={copySvg} alt="Скопировать" className="w-4"/>
                                    </button>
                                </div>

                                {order.address.comment && (
                                    <span className="badge">
                                        <span className="text-gray-500">{order.address.comment}</span>
                                    </span>
                                )}
                                {order.address.is_leave_at_door && (
                                    <span className="badge">
                                        {order.address.is_leave_at_door ? `оставить у двери` : ""}
                                    </span>
                                )}

                            </div>

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
                                Доставлено

                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ActionModal isOpen={isOpen}
                         onConfirm={setStatusSuccess}
                         onClose={() => setIsOpen(false)}
                         message="Вы уверены? В случае если заказ не был доставлен вы получите штраф в 50% от стоимости заказа"
            />
        </div>


    );
};
export default ActiveOrder;