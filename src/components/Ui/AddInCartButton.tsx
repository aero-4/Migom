import React, {JSX, useState} from "react";
import plusPng from "../../assets/plus.png";
import minusPng from "../../assets/minus-sign.png";
import {useCart} from "../../context/CartContext.tsx";


export default function AddInCartBtn({product}): JSX.Element {
    const [count, setCount] = useState<number>(0);
    const {addItem} = useCart();

    const setCountHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        const name = e.currentTarget.name;
        const delta = name === "plus" ? 1 : name === "minus" ? -1 : 0;
        const newCount = count + delta;

        if (newCount < 0 || newCount > product.count) return;

        setCount(prev => prev + delta);
        addItem({ ...product, id: product.id, image: product.photo });
    };

    return (
        <div className="flex flex-row flex-wrap ml-auto gap-2 bg-red-100 rounded-2xl p-1">
            {count <= 0 ? (
                <div>
                    <button
                        name="plus"
                        className="add__button"
                        onClick={setCountHandler}
                        aria-label="Добавить"
                    >
                        <img src={plusPng} alt="Добавить"/>
                    </button>
                </div>
            ) : (
                <div className="flex flex-row gap-2 items-center">
                    <button
                        name="minus"
                        className="add__button"
                        onClick={setCountHandler}
                        aria-label="Уменьшить"
                    >
                        <img src={minusPng} alt="Уменьшить"/>
                    </button>

                    <span className="text-center text-xl">{count}</span>

                    <button
                        name="plus"
                        className="add__button"
                        onClick={setCountHandler}
                        aria-label="Добавить ещё"
                    >
                        <img src={plusPng} alt="Добавить"/>
                    </button>
                </div>
            )}
        </div>
    );
}
