import {JSX, useEffect, useState} from "react";
import AddInCartBtn from "../components/Ui/AddInCartButton.tsx";
import config from "../../config.ts";
import {useParams} from "react-router-dom";
import Products from "../components/Widgets/Products.tsx";
import Loader from "../components/Loaders/Loader.tsx";

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
    const [isLoading, setLoading] = useState(false)
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
            setLoading(true)
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
                    return;
                }
                console.error("Failed loading products:", err);
                setProducts([]);
            } finally {
                setLoading(false)
            }
        };

        load();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, []);

    if (isLoading) return <Loader/>;

    return (
        <Products products_data={products}/>
    );
}
