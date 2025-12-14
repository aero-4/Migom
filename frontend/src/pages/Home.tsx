import React, {JSX} from "react"
import Categories from "../components/Widgets/Categories";
import Products from "../components/Widgets/Products";

export default function Home(): JSX.Element {
    return (
        <>

            <Categories/>

            <h1 className="title">Популярное</h1>

            <Products/>

            <h1 className="title">C новым годом!</h1>

            <Products/>

            <h1 className="title">Самое выгодное!</h1>

            <Products/>

        </>
    );
}