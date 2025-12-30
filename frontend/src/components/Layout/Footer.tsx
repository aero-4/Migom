import React from "react";

const Footer: React.FC = () => {
    return (
        <footer className="w-full mt-auto py-25 px-4 text-center">
            <div className="text-gray-400 flex flex-col gap-3 font-bold mx-auto w-full max-w-screen-lg">
                <a className="block" href="/documents/politics">Политика конфиденциальности</a>
                <a className="block" href="/documents/conditions">Условия использования</a>
                <span>© 2025 Все права защищены</span>
            </div>
        </footer>
    );
};

export default Footer;
