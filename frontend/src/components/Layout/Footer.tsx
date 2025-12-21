import React from "react";

const Footer: React.FC = () => {
    return (
        <footer className="w-full mt-auto py-25 px-4 text-xs text-center">
            <div className="mx-auto w-full max-w-screen-lg space-y-1">
                <a className="block" href="/info/politic_conf">Политика конфиденциальности</a>
                <a className="block" href="/info/">Условия использования</a>
                <span>© 2025 "ООО Мигом" ул. Ленина 4 г. Краснодар</span>
            </div>
        </footer>
    );
};

export default Footer;
