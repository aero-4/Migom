import React, { JSX, useEffect, useState } from "react";

import fishJpeg from "../../assets/image_test.jpg";
import AddInCartBtn from "../Ui/AddInCartButton.tsx";
import chickenPng from "../../assets/chicken.jpg";
import breadPng from "../../assets/bread.jpg";

type RawProduct = {
    id?: string;
    name?: string;
    slug?: string;
    photo?: string;
    count?: number;
    price?: number;
    gramme?: number;
    [k: string]: any;
};

export default function Products(): JSX.Element {
    const [products, setProducts] = useState<RawProduct[]>([]);

    // UUID генератор (crypto если есть)
    const genUuid = (): string => {
        if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
            return (crypto as any).randomUUID();
        }
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    };

    // исходный набор (сохраняю твои карточки и фото)
    const mock = [
        { name: "Мясо цыпленка бройлера", slug: "chicken", photo: chickenPng, count: 34, price: 199, gramme: 400 },
        { name: "Хлеб русский черный", slug: "bread-1", photo: breadPng, count: 19, price: 199, gramme: 400 },
        { name: "Хлеб русский", slug: "bread-2", photo: breadPng, count: 19, price: 199, gramme: 400 },
        { name: "Рыба соленая здравушка с икрой", slug: "fish-1", photo: fishJpeg, count: 19, price: 199, gramme: 400 },
        { name: "Рыба соленая здравушка с икрой", slug: "fish-1", photo: fishJpeg, count: 19, price: 199, gramme: 400 },
        { name: "Рыба соленая здравушка с икрой", slug: "fish-1", photo: fishJpeg, count: 19, price: 199, gramme: 400 },
        { name: "Рыба соленая здравушка с икрой", slug: "fish-1", photo: fishJpeg, count: 19, price: 199, gramme: 400 },
        { name: "Рыба соленая здравушка с икрой", slug: "fish-1", photo: fishJpeg, count: 19, price: 199, gramme: 400 },
        { name: "Рыба соленая здравушка с икрой", slug: "fish-1", photo: fishJpeg, count: 19, price: 199, gramme: 400 },
        { name: "Рыба соленая здравушка с икрой", slug: "fish-1", photo: fishJpeg, count: 19, price: 199, gramme: 400 },
        { name: "Рыба соленая здравушка с икрой", slug: "fish-1", photo: fishJpeg, count: 19, price: 199, gramme: 400 },
        { name: "Рыба соленая здравушка с икрой", slug: "fish-1", photo: fishJpeg, count: 19, price: 199, gramme: 400 },
    ];

    // Нормализуем и добавляем id если нет
    const normalize = (arr: RawProduct[]) =>
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
        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch("/api/products");
                if (!res.ok) throw new Error("no products");
                const data = await res.json();
                if (!cancelled) {
                    const normalized = normalize(Array.isArray(data) ? data : []);
                    // если сервер вернул пустой массив — используем mock
                    setProducts(normalized.length ? normalized : normalize(mock));
                }
            } catch {
                if (!cancelled) {
                    setProducts(normalize(mock));
                }
            }
        };

        load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div className="justify-center font-bold flex flex-wrap gap-2 items-center bg-white rounded-xl p-3 ">
                {products.map((product) => (
                    <div className="product__card" key={product.id ?? product.slug}>
                        <a href={`/product/${product.slug}`}>
                            <img src={product.photo} alt={product.slug} className="product__img" />
                        </a>
                        <div className="min-w-0">
                            <p className="font-bold text-xs text-gray truncate">{product.name}</p>
                            <div className="flex flex-row">
                                <div className="flex flex-col flex-wrap">
                                    <p className="text-lg">{product.price} ₽</p>
                                    <span className="text-gray-500 text-xs">{product.gramme} г</span>
                                </div>
                                <div className="ml-auto mt-2">
                                    <AddInCartBtn product={product} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
