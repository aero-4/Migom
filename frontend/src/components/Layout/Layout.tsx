import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { CartProvider } from "../../context/CartContext";

const Layout: React.FC = () => {
    return (
        <CartProvider>
            <div className="flex flex-col mx-auto min-h-screen max-w-screen-lg">
                <Navbar />

                <main className="flex-1 overflow-auto">
                    <div className="w-full h-full">
                        <Outlet />
                    </div>
                </main>

                <Footer />
            </div>
        </CartProvider>
    );
};

export default Layout;
