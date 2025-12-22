import React from 'react';
import {useNavigate} from "react-router-dom";

function MiniCard({product}) {
    const navigate = useNavigate();

    return (
        <div
            key={product.id ?? `${product.name}-${Math.random()}`}
            className="flex flex-row h-full gap-3 p-3 overflow-hidden"

        >
            <img src={product.photo}
                 className="w-32"
                 onClick={() => navigate(`/product/${product.id}`)}/>
            <div className="flex flex-col h-full w-full flex-1 min-w-0">
                <div className="font-medium text-sm md:text-[16px]">
                    {product.name}
                </div>
                <div className="font-medium flex flex-row gap-1">
                    <p className="text-gray-400">
                        {product.grams} г. /
                    </p>

                    <p className="font-medium text-gray-400">
                        {product.quantity} шт.
                    </p>
                </div>

                <div className="font-medium mt-auto text-gray-600">
                    {product.discount_price ? product.discount_price : product.price} ₽
                </div>
            </div>
        </div>
    );
}

export default MiniCard;