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

const Navbar: React.FC = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);

    const desktopMenuRef = useRef<HTMLDivElement | null>(null);
    const mobileMenuRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handlePointerDown(e: PointerEvent) {
            const target = e.target as Node | null;

            const clickedInDesktop = desktopMenuRef.current?.contains(target) ?? false;
            const clickedInMobile = mobileMenuRef.current?.contains(target) ?? false;

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

    const toggleMenu = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setMenuOpen((v) => !v);
    };

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
                <div className="flex flex-row gap-6">
                    <NavLink to="/" className="flex items-center gap-1">
                        <img src={homeSvg} alt="Лого" />
                        <h1>Мигом</h1>
                    </NavLink>

                    <Search />

                    <div ref={desktopMenuRef} className="flex flex-row relative ml-auto">
                        {isMenuOpen && (
                            <div className="absolute top-full right-0 z-[1001] mt-1">
                                <Menu onClose={() => setMenuOpen(false)} />
                            </div>
                        )}

                        <CartWidget />

                        <button
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
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4 w-full z-50" role="navigation">
                <div className="flex justify-around items-center">
                    <button onClick={() => navigate("/")}>
                        <img src={homeMobileSvg} alt="Домой" className="w-6 h-6" />
                    </button>

                    <button onClick={() => setMobileSearchOpen(true)}>
                        <img src={searchMobileSvg} alt="Поиск" className="w-7 h-7" />
                    </button>

                    <CartWidget />

                    <div ref={mobileMenuRef} className="relative">
                        <button
                            onClick={toggleMenu}
                            aria-expanded={isMenuOpen}
                            aria-haspopup="menu"
                            className="menu__button p-3"
                        >
                            <img src={profileSvg} alt="Профиль" className="w-6 h-6" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute bottom-full -top-40 mr-10 z-[1001]">
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