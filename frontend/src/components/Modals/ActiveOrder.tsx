import React, {useRef, useState} from "react";
import OpenButton from "../Ui/OpenButton.tsx";
import MiniCard from "../Ui/MiniCard.tsx";
import MapToPlace from "../Ui/Map.tsx";

const ActiveOrder = ({order}) => {
    const modalRef = useRef<HTMLDivElement | null>(null);

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="border border-gray-200 rounded-3xl relative w-full h-full bg-white md:h-auto shadow-lg p-6 md:mx-0 md:max-w-[600px] md:max-h-[80vh] overflow-auto">

                <div className="flex flex-col">

                    <MapToPlace destinationAddress={`${order.address.city} ${order.address.street} ${order.address.house_number}`}/>

                    <div className="mt-auto h-full max-h-250 card bg-yellow-300 rounded-4xl">
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

                            </div>

                            <OpenButton className="mx-auto justify-center" elements={order.products.map((product) => (
                                <MiniCard product={product}/>
                            ))}/>
                        </div>
                    </div>

                    <button className="big__button bg-green-100 text-green-600">
                        Доставлено
                    </button>

                </div>
            </div>
        </div>
    );
};
export default ActiveOrder;