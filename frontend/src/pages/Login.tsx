import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
        setError(null);
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setError(null);

        if (!form.email.trim() || !form.password) {
            setError("Укажите email и пароль");
            return;
        }

        if (form.password.length < 8) {
            setError("Пароль должен быть минимум 8 символов");
            return;
        }

        setLoading(true);
        const res = await login({ email: form.email.trim(), password: form.password });
        setLoading(false);

        if (!res.ok) {
            setError(res.message || "Неверные данные");
            return;
        }

        navigate("/");
    };

    return (
        <div className="flex items-center justify-center p-4 transition">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-md rounded-2xl p-6 gap-4 flex flex-col">
                <h2 className="text-xl font-semibold text-center">Вход</h2>

                <label className="flex flex-col text-sm">
                    <span className="mb-1">Email</span>
                    <input
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        type="email"
                        className="input"
                        autoComplete="email"
                    />
                </label>

                <label className="flex flex-col text-sm">
                    <span className="mb-1">Пароль</span>
                    <input
                        name="password"
                        value={form.password}
                        onChange={onChange}
                        type="password"
                        className="input"
                        autoComplete="current-password"
                    />
                </label>

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <div className="flex flex-col gap-3">
                    <button
                        type="submit"
                        className="btn__circle bg-blue-600 hover:bg-blue-600/90 active:bg-blue-600/80"
                        disabled={loading}
                    >
                        Войти
                    </button>
                </div>

                <div className="text-center mt-3 text-sm">
                    <button type="button" className="w-full hover:text-gray-600" onClick={() => navigate("/register")}>
                        Зарегистрироваться
                    </button>
                </div>
            </form>
        </div>
    );
}
