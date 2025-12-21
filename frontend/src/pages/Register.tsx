import React, {useState} from "react";
import Loader from "../components/Loaders/Loader";
import config from "../../config.ts";
import ToggleSwitch from "../components/Ui/ToggleSwitch.tsx";

export default function Register() {
    const [isConfirmData, setConfirmData] = useState(false)
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        birthdate: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [serverError, setServerError] = useState(null);

    const isValidEmail = (email) => {
        return /^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/.test(
            String(email)
        );
    };

    const isStrongPassword = (pw) => {
        return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,32}$/.test(pw);
    };

    const validate = (values) => {
        const e = {};
        if (!values.firstName.trim()) e.firstName = "Укажите имя";
        if (!values.lastName.trim()) e.lastName = "Укажите фамилию";
        if (!values.email.trim()) e.email = "Укажите email";
        else if (!isValidEmail(values.email.trim())) e.email = "Некорректный email";

        if (!values.password) e.password = "Укажите пароль";
        else if (!isStrongPassword(values.password)) e.password = "Пароль должен быть 8–32 символа, содержать буквы и цифры";

        if (!values.confirmPassword) e.confirmPassword = "Подтвердите пароль";
        else if (values.password !== values.confirmPassword) e.confirmPassword = "Пароли не совпадают";

        if (values.birthdate) {
            const d = new Date(values.birthdate);
            if (Number.isNaN(d.getTime())) e.birthdate = "Некорректная дата";
        }

        return e;
    };

    const onChange = (e) => {
        setForm((s) => ({...s, [e.target.name]: e.target.value}));
        setErrors((prev) => ({...prev, [e.target.name]: undefined}));
        setServerError(null);
        setSuccess(null);
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setServerError(null);
        const v = validate(form);
        setErrors(v);
        if (Object.keys(v).length) return;

        setLoading(true);
        try {
            const payload = {
                first_name: form.firstName.trim(),
                last_name: form.lastName.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                birthday: form.birthdate ? form.birthdate : null,
            };

            const res = await fetch(config.API_URL + "/api/auth/register/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(payload),
            });



            const json = await res.json().catch(() => null);

            if (json && typeof json === "object" && "detail" in json && json.detail) {
                setServerError(json.detail);
                setLoading(false);
                return;
            }

            if (json && json.msg && String(json.msg) === "Register succesfull") {
                window.location.assign("/");
                return;
            }

            if (!res.ok) {
                const msg = (json && (json.error || json.message)) || `Ошибка: ${res.status}`;
                setServerError(msg);
                setLoading(false);
                return;
            }

            setSuccess((json && (json.message || "Успешно зарегистрированы!")) || "Успешно зарегистрированы!");
            setForm({firstName: "", lastName: "", birthdate: "", email: "", password: "", confirmPassword: ""});
        } catch (err) {
            setServerError("Сетевая ошибка. Попробуйте ещё раз.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center p-2">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg bg-white shadow-md rounded-2xl p-6 gap-3 flex flex-col"
                aria-label="Форма регистрации"
            >
                <h2 className="p-3 text-xl font-semibold text-center">Регистрация</h2>

                <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col text-sm">
                        <span className="mb-1">Имя</span>
                        <input
                            id="firstName"
                            name="firstName"
                            value={form.firstName}
                            onChange={onChange}
                            className={`input border ${errors.firstName ? "border-red-400" : "border-gray-200"}`}
                            aria-invalid={!!errors.firstName}
                        />
                        {errors.firstName && <small className="text-red-500 mt-1">{errors.firstName}</small>}
                    </label>

                    <label className="flex flex-col text-sm">
                        <span className="mb-1">Фамилия</span>
                        <input
                            id="lastName"
                            name="lastName"
                            value={form.lastName}
                            onChange={onChange}
                            className={`input rounded-md border ${errors.lastName ? "border-red-400" : "border-gray-200"}`}
                            aria-invalid={!!errors.lastName}
                        />
                        {errors.lastName && <small className="text-red-500 mt-1">{errors.lastName}</small>}
                    </label>
                </div>

                <label className="flex flex-col text-sm">
                    <span className="mb-1">Дата рождения</span>
                    <input
                        id="birthdate"
                        name="birthdate"
                        value={form.birthdate}
                        onChange={onChange}
                        type="date"
                        className={`input border ${errors.birthdate ? "border-red-400" : "border-gray-200"}`}
                        aria-invalid={!!errors.birthdate}
                    />
                    {errors.birthdate && <small className="text-red-500 mt-1">{errors.birthdate}</small>}
                </label>

                <label className="flex flex-col text-sm">
                    <span className="mb-1">Email</span>
                    <input
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        type="email"
                        className={`input border ${errors.email ? "border-red-400" : "border-gray-200"}`}
                        aria-invalid={!!errors.email}
                        autoComplete="email"
                    />
                    {errors.email && <small className="text-red-500 mt-1">{errors.email}</small>}
                </label>

                <div className="flex flex-col gap-2">
                    <label className="flex flex-col text-sm">
                        <span className="mb-1">Пароль</span>
                        <input
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={onChange}
                            type="password"
                            className={`input border ${errors.password ? "border-red-400" : "border-gray-200"}`}
                            aria-invalid={!!errors.password}
                            autoComplete="new-password"
                        />
                        {errors.password && <small className="text-red-500 mt-1">{errors.password}</small>}
                    </label>

                    <label className="flex flex-col text-sm">
                        <span className="mb-1">Подтвердите пароль</span>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={onChange}
                            type="password"
                            className={`input border ${errors.confirmPassword ? "border-red-400" : "border-gray-200"}`}
                            aria-invalid={!!errors.confirmPassword}
                            autoComplete="new-password"
                        />
                        {errors.confirmPassword && <small className="text-red-500 mt-1">{errors.confirmPassword}</small>}
                    </label>
                </div>

                {serverError && <div className="text-red-600 text-sm">{serverError}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}

                <ToggleSwitch
                    checked={isConfirmData}
                    onCheckedChange={() => setConfirmData(!isConfirmData)}
                    label={"Подтверждаю обработку персональных данных"}/>

                <button
                    type="submit"
                    className={`${!isConfirmData ? "cursor-not-allowed" : "cursor-pointer"} my-3 btn__circle bg-blue-600 hover:bg-blue-600/90 active:bg-blue-600/80`}
                    disabled={!isConfirmData}
                    aria-busy={loading}
                >
                    Зарегистрироваться
                </button>
            </form>
        </div>
    );
}
