import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen justify-center items-center">
            <Navbar />

            <main className="flex-1 flex overflow-auto justify-center items-center p-2">
                <Outlet />
            </main>

            <footer className="text-xs lg:text-lg p-3 gap-3 bg-gray-100 w-screen text-center">
                <a className="block" href="/info/politic_conf">Политика конфиденциальности</a>
                <a className="block" href="/info/">Условия использования</a>
                © 2021-2025 "ООО Мигом" ул. Ленина 4 г. Краснодар
            </footer>
        </div>
    );
};

export default Layout;
