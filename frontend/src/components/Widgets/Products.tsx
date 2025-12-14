import {JSX, useEffect, useRef, useState} from "react";
import AddInCartBtn from "../Ui/AddInCartButton.tsx";
import config from "../../../config.ts";

type Product = {
    id?: string;
    name?: string;
    slug?: string;
    photo?: string;
    count?: number;
    price?: number;
    gramme?: number;
    discount_price?: number;
    discount?: number;
    content?: string;
    [k: string]: any;
};

export default function Products({products_data = []}: { products_data?: Product[] }): JSX.Element {
    const [products, setProducts] = useState<Product[]>(products_data);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

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
                const res = await fetch(`${config.API_URL}/api/products`, {signal: controller.signal});
                if (!res.ok) throw new Error("No products");
                const data = await res.json();
                if (!mounted) return;
                const normalized = normalize(Array.isArray(data) ? data : []);
                setProducts(normalized);
            } catch (err: any) {
                if (!mounted) return;
                if (err.name === "AbortError") return;
                console.error("Failed loading products:", err);
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
            <div ref={wrapperRef} className="w-full p-2">
                <div className={`
                        grid gap-1
                        [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]
                        md:[grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]
                      `}
                >
                    {products.map((product) => (
                        <div key={product.id ?? product.slug} className="product__card">
                            <a href={`/product/${product.id}`} style={{display: "block"}}>
                                <img
                                    src={product.photo}
                                    alt="Фото продукта"
                                    className="product__img"
                                    loading="lazy"
                                />

                            </a>

                            <div className="absolute " style={{alignSelf: "flex-end"}}>
                                <AddInCartBtn product={product}/>
                            </div>

                            <p className="product__name"
                               title={product.name}>
                                {product.name}
                            </p>

                            <div className="flex flex-row mt-auto" style={{alignItems: "flex-end"}}>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-gray-500 text-xs block">{product.gramme} г</span>

                                    {product.discount_price ? (
                                        <div style={{position: "relative"}} className="flex flex-col">
                                            <p className="font-bold text-gray-500 line-through" style={{marginTop: 4}}>
                                                {product.price} ₽
                                            </p>

                                            <div className="flex flex-row" style={{alignItems: "center"}}>
                                                <p className="text-xl md:text-2xl font-bold">
                                                    {product.discount_price} ₽
                                                </p>

                                                <p
                                                    className="badge__covered px-3"
                                                    style={{
                                                        position: "absolute",
                                                        right: 8,
                                                        top: -8,
                                                        marginLeft: 0,
                                                        marginTop: 0,
                                                    }}
                                                >
                                                    -{product.discount}%
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold">{product.price} ₽</p>
                                        </div>
                                    )}
                                </div>


                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
