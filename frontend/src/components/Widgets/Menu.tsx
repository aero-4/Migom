import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ExitButton from "../Ui/ExitButton.tsx";

type Props = {
    onClose?: () => void;
};

export default function Menu({ onClose }: Props): JSX.Element {
    const { isAuthenticated, user} = useAuth();

    const handleClose = () => {
        onClose?.();
    };

    return (
        <div
            className="absolute z-50 top-10 right-0 p-6 flex flex-col gap-1 rounded-md bg-white shadow transition-all border border-gray-200 border-1"
            role="menu"
            aria-orientation="vertical"
        >
            {isAuthenticated ? (
                <div className="flex flex-col gap-1">
                    <NavLink to="/profile" onClick={handleClose} className="big__button text-gray-500 bg-gray-100 px-24">
                        Профиль
                    </NavLink>
                    <NavLink to="/orders" onClick={handleClose} className="big__button text-orange-500 bg-orange-100">
                        Мои заказы
                    </NavLink>
                    {user.role === 2 && (
                        <NavLink to="/courier" onClick={handleClose} className="big__button text-yellow-500 bg-yellow-100">
                            Меню курьеров
                        </NavLink>
                    )}

                    {user.role === 3 && (
                        <NavLink to="/cook" onClick={handleClose} className="big__button text-yellow-500 bg-yellow-100">
                            Меню поваров
                        </NavLink>
                    )}

                    <ExitButton/>
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    <NavLink to="/login" onClick={handleClose} className="big__button text-red-500 bg-red-100 px-24">
                        Войти
                    </NavLink>
                    <NavLink to="/register" onClick={handleClose} className="big__button text-blue-500 bg-blue-100 px-24">
                        Регистрация
                    </NavLink>
                </div>
            )}
        </div>
    );
}
