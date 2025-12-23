import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import searchSvg from "../../assets/search.svg";
import config from "../../../config";
import Products from "../Widgets/Products.tsx";
import Loader from "../Loaders/Loader.tsx";
import MiniCard from "./MiniCard.tsx";

type SearchDataDTO = { [key: string]: any };
type ProductItem = { [key: string]: any };

const DEBOUNCE = 500;

export const parseInputToDTO = (raw: string): SearchDataDTO => {
    const value = raw.trim();
    if (!value) return {};
    const dto: SearchDataDTO = {};
    const isNumber = /^[\d]+([.,]\d+)?$/.test(value);
    const isInteger = /^[\d]+$/.test(value);
    if (isNumber) {
        const num = parseFloat(value.replace(",", "."));
        if (!Number.isFinite(num)) return {};
        dto.price = num;
        if (isInteger) {
            dto.grams = num;
            dto.protein = num;
            dto.fats = num;
            dto.carbohydrates = num;
            dto.category_id = num;
        }
        return dto;
    }
    dto.name = value;
    dto.content = value;
    return dto;
};

const Search: React.FC = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [noResults, setNoResults] = useState(false);

    const navigate = useNavigate();
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<number | undefined>(undefined);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const lastQueryRef = useRef<string | null>(null);

    const [dropdownStyle, setDropdownStyle] = useState<{ left: number; top: number; width: number } | null>(null);
    const [dropdownMaxHeight, setDropdownMaxHeight] = useState<string>("0px");
    const [dropdownOpacity, setDropdownOpacity] = useState<number>(0);
    const [dropdownTransform, setDropdownTransform] = useState<string>("translateY(-6px)");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        closeDropdownImmediate();
        setResults([]);
    }, [location.pathname]);

    useLayoutEffect(() => {
        const updatePosition = () => {
            if (!wrapperRef.current) return;
            const rect = wrapperRef.current.getBoundingClientRect();
            const gutter = 8;
            const maxAvailableWidth = Math.max(200, window.innerWidth - gutter * 2);
            const width = Math.min(rect.width, maxAvailableWidth);
            const left = Math.min(Math.max(gutter, rect.left), Math.max(gutter, window.innerWidth - width - gutter));
            setDropdownStyle({
                left,
                top: rect.bottom + 8,
                width,
            });
        };
        updatePosition();
        const ro = new ResizeObserver(updatePosition);
        if (wrapperRef.current) ro.observe(wrapperRef.current);
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            ro.disconnect();
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            closeDropdownImmediate();
            setResults([]);
            return;
        }

        window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            doSearch(query);
        }, DEBOUNCE);

        return () => window.clearTimeout(debounceRef.current);
    }, [query]);

    useEffect(() => {
        if ((results.length > 0 || noResults) && query.trim()) openDropdown();
        else closeDropdown();
    }, [results, noResults]);

    useEffect(() => {
        const onDocClick = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node | null;
            if (
                wrapperRef.current &&
                dropdownRef.current &&
                !wrapperRef.current.contains(target) &&
                !dropdownRef.current.contains(target)
            ) {
                closeDropdown();
            }
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeDropdown();
        };
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("touchstart", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("touchstart", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    const openDropdown = () => {
        if (!dropdownRef.current) {
            setIsOpen(true);
            setDropdownOpacity(1);
            setDropdownTransform("translateY(0)");
            setDropdownMaxHeight("320px");
            return;
        }
        const el = dropdownRef.current;
        setIsOpen(true);
        const full = `${Math.min(el.scrollHeight || 320, window.innerHeight * 0.7)}px`;
        setDropdownMaxHeight("0px");
        setDropdownOpacity(0);
        setDropdownTransform("translateY(-6px)");
        requestAnimationFrame(() => {
            setDropdownMaxHeight(full);
            setDropdownOpacity(1);
            setDropdownTransform("translateY(0)");
        });
    };

    const closeDropdown = () => {
        if (!dropdownRef.current) {
            setIsOpen(false);
            setDropdownOpacity(0);
            setDropdownTransform("translateY(-6px)");
            setDropdownMaxHeight("0px");
            return;
        }
        const el = dropdownRef.current;
        const full = `${Math.min(el.scrollHeight || 320, window.innerHeight * 0.7)}px`;

        setDropdownMaxHeight(full);
        requestAnimationFrame(() => {
            setDropdownMaxHeight("0px");
            setDropdownOpacity(0);
            setDropdownTransform("translateY(-6px)");
            setTimeout(() => setIsOpen(false), 220);
        });
    };

    const closeDropdownImmediate = () => {
        setIsOpen(false);
        setDropdownOpacity(0);
        setDropdownTransform("translateY(-6px)");
        setDropdownMaxHeight("0px");
    };



    const doSearch = async (value: string) => {

        if (value.trim().length <= 0) return;

        lastQueryRef.current = value;

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setNoResults(false);
        try {
            const res = await fetch(`${config.API_URL}/api/products/search`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(parseInputToDTO(value)),
                signal: controller.signal,
            });
            const data = await res.json();
            setResults(Array.isArray(data) ? data : []);
            setNoResults(Array.isArray(data) && data.length === 0);
        } catch (err: any) {
            if (err?.name === "AbortError") return;
            setResults([]);
            setNoResults(true);
        } finally {
            setLoading(false);
        }
    };

    const onResultClick = (r: ProductItem) => {
        inputRef.current?.blur();

        if (r.id != null)
            navigate(`/product/${r.id}`);
    };

    const goToBigSearch = () => {
        inputRef.current?.blur();
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const showProductsAsCards = results.length > 3;

    return (
        <>
            <div ref={wrapperRef} className="w-full max-w-150 relative justify-center">
                <div className="flex items-center rounded-full px-2 py-2 shadow-sm  backdrop-blur-sm">
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            if (query.trim()) {
                                window.clearTimeout(debounceRef.current);
                                doSearch(query);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                goToBigSearch();
                            }
                        }}
                        placeholder="Поиск..."
                        className="min-w-1/3 px-3 outline-none w-full "
                        aria-label="Поиск"
                    />
                    <div className="flex flex-row">
                        <button
                            onClick={() => {
                                navigate(`/search?q=${encodeURIComponent(query)}`);
                                inputRef.current?.blur();
                            }}
                            aria-label="Перейти на страницу поиска"
                            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
                        >
                            <img src={searchSvg} className="w-6 h-6" alt="Поиск"/>
                        </button>
                    </div>
                </div>
            </div>

            {(isOpen || results.length > 0 || noResults || loading) && (
                <div
                    ref={dropdownRef}
                    className={`bg-white fixed z-52 rounded-[20px] md:rounded-2xl md:shadow-lg ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'} bg-transparent transition-all`}
                    style={{
                        left: dropdownStyle?.left ?? 0,
                        top: dropdownStyle?.top ?? 0,
                        width: dropdownStyle?.width ?? 320,
                        maxHeight: dropdownMaxHeight,
                        opacity: dropdownOpacity,
                        transform: dropdownTransform,
                        transition: "cubic-bezier(.2,.8,.2,1), opacity 180ms linear, transform 180ms ease",
                    }}
                >
                    <div className="max-h-[70vh] overflow-y-auto">
                        {results.length === 0 && noResults && (
                            <div className="p-4 text-sm text-gray-500">Ничего не найдено</div>
                        )}

                        {showProductsAsCards ? (
                            <Products products_data={results}/>
                        ) : (
                            results.map((r) => (
                                <div key={r.id ?? JSON.stringify(r)} onClick={() => onResultClick(r)}>
                                    <MiniCard product={r}/>
                                </div>
                            ))
                        )}
                        {results.length > 0 && (
                            <div className="p-3">
                                <button
                                    onClick={goToBigSearch}
                                    className="big__button full__button w-full"
                                >
                                    Перейти на страницу поиска
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </>
    );
};

export default Search;
