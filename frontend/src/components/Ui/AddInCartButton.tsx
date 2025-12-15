import React from "react";
import plusPng from "../../assets/plus.png";
import minusPng from "../../assets/minus-sign.png";
import { useCart } from "../../context/CartContext.tsx";

export default function AddInCartBtn({ product, className = "", label = "" }) {
    const { items, addItem, setQty, removeItem } = useCart();

    const cartItem = items.find(i => i.id === product.id);
    const qty = cartItem?.qty ?? 0;

    const isBig = Boolean(label);

    const baseBtn =
        "add__button flex items-center justify-center rounded-full transition";
    const sizeBtn = isBig
        ? "px-6 py-6 text-base min-h-[48px]"
        : "p-4 min-h-[32px]";

    const inc = () => {
        if (qty === 0) {
            addItem({ ...product, image: product.photo });
        } else {
            setQty(product.id, +1);
        }
    };

    const dec = () => {
        if (qty <= 1) {
            removeItem(product.id);
        } else {
            setQty(product.id, -1);
        }
    };

    return (
        <div className={`${className} flex flex-row bg-red-100 rounded-full`}>
            {qty === 0 ? (
                <button
                    type="button"
                    onClick={inc}
                    className={`${baseBtn} ${sizeBtn} gap-2`}
                    aria-label="Добавить"
                >
                    <img
                        src={plusPng}
                        className={isBig ? "w-4 h-4" : "w-3 h-3"}
                        alt="Добавить"
                    />
                    {label && (
                        <span className="text-gray-700 whitespace-nowrap">
                            {label}
                        </span>
                    )}
                </button>
            ) : (
                <div className="flex flex-row gap-2 items-center">
                    <button
                        type="button"
                        onClick={dec}
                        className={`${baseBtn} ${sizeBtn}`}
                        aria-label="Уменьшить"
                    >
                        <img
                            src={minusPng}
                            className={isBig ? "w-4 h-4" : "w-3 h-3"}
                            alt="Уменьшить"
                        />
                    </button>

                    <span className={`text-center text-gray-700 font-semibold ${isBig ? "text-base px-2" : "text-xs"}`}>
                        {qty}
                    </span>

                    <button
                        type="button"
                        onClick={inc}
                        className={`${baseBtn} ${sizeBtn}`}
                        aria-label="Добавить ещё"
                    >
                        <img
                            src={plusPng}
                            className={isBig ? "w-4 h-4" : "w-3 h-3"}
                            alt="Добавить"
                        />
                    </button>
                </div>
            )}
        </div>
    );
}
