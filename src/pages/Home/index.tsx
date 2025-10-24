import React, {JSX} from "react"
import Categories from "../../components/Widgets/Categories.tsx";
import Products from "../../components/Widgets/Products.tsx";
import {CartWidget} from "../../components/Widgets/Cart.tsx";
import { CartProvider } from "../../context/CartContext";

export default function Home(): JSX.Element {
    return (
        <>
            <div>
                <h1 className="text-2xl p-3">Доставим <span className="text-red-400">мигом</span> за 15 минут</h1>

                    <Categories/>

                    <h1 className="text-3xl p-3">Популярное:</h1>

                <CartProvider>
                    <Products/>

                    <CartWidget/>
                </CartProvider>
            </div>
        </>
    );
}