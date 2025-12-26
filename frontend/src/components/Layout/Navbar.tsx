import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import profileSvg from "../../assets/profile.svg";
import homeSvg from "../../assets/fire-32.png";
import searchMobileSvg from "../../assets/search.svg";
import homeMobileSvg from "../../assets/fire-32.png";

import Search from "../Ui/Search.tsx";
import Menu from "../Widgets/Menu.tsx";
import CartWidget from "../Widgets/Cart.tsx";
import CloseButton from "../Ui/CloseButton.tsx";
import { useCart } from "../../context/CartContext.tsx";

const Navbar: React.FC = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
    const { isOpen: isCartOpen } = useCart();

    const desktopMenuContainerRef = useRef<HTMLDivElement | null>(null);
    const desktopMenuWrapperRef = useRef<HTMLDivElement | null>(null);
    const profileButtonRefDesktop = useRef<HTMLButtonElement | null>(null);

    const mobileMenuContainerRef = useRef<HTMLDivElement | null>(null);
    const mobileMenuWrapperRef = useRef<HTMLDivElement | null>(null);
    const profileButtonRefMobile = useRef<HTMLButtonElement | null>(null);

    const [placementDesktop, setPlacementDesktop] = useState<"bottom" | "top">("bottom");
    const [placementMobile, setPlacementMobile] = useState<"bottom" | "top">("top");

    const navigate = useNavigate();

    useEffect(() => {
        function handlePointerDown(e: PointerEvent) {
            const target = e.target as Node | null;

            const clickedInDesktop = desktopMenuContainerRef.current?.contains(target) ?? false;
            const clickedInMobile = mobileMenuContainerRef.current?.contains(target) ?? false;

            if (!clickedInDesktop && !clickedInMobile) {
                setMenuOpen(false);
            }
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setMenuOpen(false);
                setMobileSearchOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (!isMenuOpen) return;

        const measureDesktop = () => {
            const wrapper = desktopMenuWrapperRef.current;
            const btn = profileButtonRefDesktop.current;
            if (!wrapper || !btn) return;

            const menuHeight = wrapper.offsetHeight;
            const btnRect = btn.getBoundingClientRect();

            if (btnRect.bottom + menuHeight > window.innerHeight) {
                setPlacementDesktop("top");
            } else {
                setPlacementDesktop("bottom");
            }
        };

        const measureMobile = () => {
            const wrapper = mobileMenuWrapperRef.current;
            const btn = profileButtonRefMobile.current;
            if (!wrapper || !btn) return;

            const menuHeight = wrapper.offsetHeight;
            const btnRect = btn.getBoundingClientRect();

            if (btnRect.bottom + menuHeight > window.innerHeight) {
                setPlacementMobile("top");
            } else {
                setPlacementMobile("bottom");
            }
        };

        const raf = requestAnimationFrame(() => {
            measureDesktop();
            measureMobile();
        });

        return () => cancelAnimationFrame(raf);
    }, [isMenuOpen]);

    const toggleMenu = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setMenuOpen((v) => !v);
    };

    useEffect(() => {
        if (isCartOpen) {
            setMenuOpen(false);
        }
    }, [isCartOpen]);


    return (
        <>
            {isMobileSearchOpen && (
                <div className="fixed inset-0 bg-black/50 z-[1000] flex" onClick={() => setMobileSearchOpen(false)}>
                    <div
                        className="flex flex-col gap-6 bg-white card h-50 w-full p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-end">
                            <CloseButton close={() => setMobileSearchOpen(false)} />
                        </div>
                        <Search />
                    </div>
                </div>
            )}

            <nav className="hidden md:block bg-white rounded-b-3xl p-3 w-full z-50 sticky top-0">
                <div className="flex flex-row gap-9">
                    <NavLink to="/" className="menu__button flex-row gap-2">
                        <img src={homeSvg} alt="Лого" />
                        <h1>Мигом</h1>
                    </NavLink>

                    <Search />

                    <div ref={desktopMenuContainerRef} className="flex flex-row relative ml-auto">
                        {isMenuOpen && (
                            <div
                                ref={desktopMenuWrapperRef}
                                className={`absolute ${placementDesktop === "bottom" ? "top-full mt-1" : "bottom-full mb-1"} right-0 z-[1001]`}
                            >
                                <Menu onClose={() => setMenuOpen(false)} />
                            </div>
                        )}

                        <CartWidget />

                        <button
                            ref={profileButtonRefDesktop}
                            onClick={toggleMenu}
                            aria-expanded={isMenuOpen}
                            aria-haspopup="menu"
                            className="menu__button p-3"
                        >
                            <img src={profileSvg} alt="Профиль" className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Мобильный навбар - FIXED внизу экрана */}
            <div ref={mobileMenuContainerRef}
                 className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4 w-full z-50 overflow-visible">
                <div className="flex justify-around items-center">
                    <button className="menu__button" onClick={() => navigate("/")}>
                        <img src={homeMobileSvg} alt="Домой" className="w-6 h-6" />
                    </button>

                    <button className="menu__button"  onClick={() => setMobileSearchOpen(true)}>
                        <img src={searchMobileSvg} alt="Поиск" className="w-7 h-7" />
                    </button>

                    <CartWidget />

                    <div className="relative">
                        <button
                            ref={profileButtonRefMobile}
                            onClick={toggleMenu}
                            aria-expanded={isMenuOpen}
                            aria-haspopup="menu"
                            className="menu__button p-3"
                        >
                            <img src={profileSvg} alt="Профиль" className="w-6 h-6" />
                        </button>

                        {isMenuOpen && (
                            <div
                                ref={mobileMenuWrapperRef}
                                className="absolute bottom-full mb-2 right-0 z-[1001]"
                            >
                                <Menu onClose={() => setMenuOpen(false)} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
