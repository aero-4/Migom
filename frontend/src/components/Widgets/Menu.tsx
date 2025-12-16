import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ExitButton from "../Ui/ExitButton.tsx";

type Props = {
    onClose?: () => void;
};

export default function Menu({ onClose }: Props): JSX.Element {
    const { isAuthenticated, logout } = useAuth();

    const handleClose = () => {
        onClose?.();
    };

    const logoutClick = async () => {
        await logout();
        handleClose();
    };

    return (
        <div
            className="absolute z-50 top-10 right-0 p-6 flex flex-col gap-1 rounded-md bg-white shadow transition-all border border-gray-200 border-1"
            role="menu"
            aria-orientation="vertical"
        >
            {isAuthenticated ? (
                <div className="flex flex-col gap-2">
                    <NavLink to="/profile" onClick={handleClose} className="big__button px-24">
                        Профиль
                    </NavLink>
                    <NavLink to="/orders" onClick={handleClose} className="big__button">
                        Мои заказы
                    </NavLink>
                    <ExitButton/>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <NavLink to="/login" onClick={handleClose} className="big__button px-24">
                        Войти
                    </NavLink>
                    <NavLink to="/register" onClick={handleClose} className="big__button px-24">
                        Регистрация
                    </NavLink>
                </div>
            )}
        </div>
    );
}
