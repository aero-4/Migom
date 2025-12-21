import {JSX, useEffect, useState} from "react";
import AddInCartBtn from "../components/Ui/AddInCartButton.tsx";
import config from "../../config.ts";
import {useParams} from "react-router-dom";

type Product = {
    id?: string;
    name?: string;
    slug?: string;
    photo?: string;
    count?: number;
    price?: number;
    gramme?: number;
    [k: string]: any;
};

export default function Category(): JSX.Element {
    const {id} = useParams();
    const [products, setProducts] = useState<Product[]>([]);

    const genUuid = (): string => {
        if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
            return (crypto as any).randomUUID();
        }
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    };
    const normalize = (arr: Product[]) =>
        arr.map((p) => ({
            ...p,
            id: p.id && String(p.id).trim() ? String(p.id) : genUuid(),
            name: p.name ?? p.slug ?? "Без имени",
            photo: p.photo ?? p.image ?? "",
            count: typeof p.count === "number" ? p.count : Number(p.count ?? 0),
            price: typeof p.price === "number" ? p.price : Number(p.price ?? 0),
            gramme: typeof p.gramme === "number" ? p.gramme : Number(p.gramme ?? 0),
        }));

    useEffect(() => {
        const controller = new AbortController();
        let mounted = true;

        const load = async () => {
            try {
                const res = await fetch(
                    `${config.API_URL}/api/products/search`,
                    {
                        method: "POST",
                        signal: controller.signal,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({"category_id": Number.parseInt(id)})
                    }
                );
                if (!res.ok)
                    throw new Error("No products");
                const data = await res.json();
                if (!mounted)
                    return;
                const normalized = normalize(Array.isArray(data) ? data : []);
                setProducts(normalized);
            } catch (err: any) {
                if (!mounted) return;
                if (err.name === "AbortError") {
                    // запрос отменён, ничего не делаем
                    return;
                }
                console.error("Failed loading products:", err);
                // безопасное поведение при ошибке — пустой список или предыдущие данные
                setProducts([]);
            }
        };

        load();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, []);

    return (
        <>
            <div className="grid
                            grid-cols-2
                            sm:grid-cols-2
                            md:grid-cols-3
                            lg:grid-cols-4
                            gap-2">


                {products.map(product => (
                    <div
                        key={product.id ?? product.slug}
                        className="product__card"
                    >
                        <a href={`/product/${product.id}`}>

                            <img src={product.photo}
                                 alt="Фото продукта"
                                 className="product__img"/>

                        </a>

                        <p className="product__name product__name--2lines">{product.name}</p>

                        <div className="flex items-center">
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs block">
                                    {product.gramme} г
                                </span>

                                {product.discount_price ? (
                                    <div className="flex flex-col">
                                        <p className="font-bold text-gray-500 line-through">
                                            {product.price} ₽
                                        </p>

                                        <p className="text-xl md:text-2xl font-bold">
                                            {product.discount_price} ₽
                                        </p>

                                        <p className="badge__covered ml-11">
                                            -{product.discount}%
                                        </p>

                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xl md:text-2xl font-bold">
                                            {product.price} ₽
                                        </p>
                                    </div>
                                )}


                            </div>

                            <div className="ml-auto mt-7">
                                <AddInCartBtn product={product}/>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
