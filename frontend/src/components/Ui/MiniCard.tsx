import React from 'react';
import {useNavigate} from "react-router-dom";

function MiniCard({product}) {
    const navigate = useNavigate();

    return (
        <div
            key={product.id ?? `${product.name}-${Math.random()}`}
            className="flex flex-row gap-3 p-3 overflow-hidden"

        >
            <div className="flex-shrink-0 w-32 rounded ">
                {product.photo ?
                    <img src={product.photo}
                         lt={product.name}
                         className="img"
                         onClick={() => navigate(`/product/${product.id}`)}/> : <div/>}
            </div>
            <div className="flex flex-col h-full w-full flex-1 min-w-0">
                <div className="product__name">
                    {product.name}
                </div>
                <p className="text-xs text-gray-400">
                    {product.grams} г.
                </p>

                <div className="font-medium mt-auto text-gray-600">
                    {product.discount_price ? product.discount_price : product.price} ₽
                </div>
            </div>
        </div>
    );
}

export default MiniCard;