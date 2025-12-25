import React, {useEffect, useRef, useState} from "react";
import {useSearchParams} from "react-router-dom";
import Products from "../components/Widgets/Products.tsx";
import Loader from "../components/Loaders/Loader.tsx";
import config from "../../config.ts";
import Search, {parseInputToDTO} from "../components/Ui/Search.tsx";

type ProductItem = {
    id?: number | string;
    name?: string;
    photo?: string;
    price?: number | null;
    [k: string]: any;
};

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q");

    const [results, setResults] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [noResults, setNoResults] = useState(false);

    const abortRef = useRef<AbortController | null>(null);


    useEffect(() => {
        if (!q.trim()) {
            setResults([]);
            setNoResults(false);
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const doSearch = async () => {
            setLoading(true);
            setNoResults(false);

            try {
                const res = await fetch(`${config.API_URL}/api/products/search`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(parseInputToDTO(q)),
                    signal: controller.signal,
                });

                const data = await res.json();
                const arr = Array.isArray(data) ? data : [];

                setResults(arr);
                setNoResults(arr.length === 0);
            } catch (err: any) {
                if (err?.name === "AbortError") return;
                setResults([]);
                setNoResults(true);
            } finally {
                setLoading(false);
            }
        };

        doSearch();

        return () => controller.abort();
    }, [q]);

    if (loading) return <Loader/>;

    return (
        <div>
            <div className="flex flex-row gap-3">
                <h1 className="title">Результаты по запросу</h1>
                <p className="text-lg text-gray-400 font-bold text-center my-auto">{q}</p>
            </div>

            <div className="flex flex-row gap-3 items-center">

                {!loading && noResults && (
                    <div className="text-gray-500 title text-lg">
                        Ничего не было найдено
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <Products products_data={results}/>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
