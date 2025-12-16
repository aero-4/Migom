import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import config from "../../config";
import CloseButton from "../components/Ui/CloseButton.tsx";
import ExitButton from "../components/Ui/ExitButton.tsx";

const ChangePasswordModal: React.FC<{
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}> = ({ open, onClose, onSuccess }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const MIN_PASSWORD_LENGTH = 8;
    const modalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) {
            setCurrentPassword("");
            setNewPassword("");
            setDetailError(null);
            setSuccess(null);
            setLoading(false);
        }
    }, [open]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const onBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && e.target === modalRef.current) {
            onClose();
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setDetailError(null);
        setSuccess(null);

        if (!currentPassword || !newPassword) {
            setDetailError("Заполните все поля.");
            return;
        }
        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            setDetailError(`Новый пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов.`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(config.API_URL + "/api/users/password", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    password: currentPassword,
                    new_password: newPassword,
                }),
            });

            const json = await res.json().catch(() => null);

            if (!res.ok) {
                const msg = (json && (json.detail || json.error || json.message)) || `Ошибка: ${res.status}`;
                setDetailError(String(msg));
                return;
            }

            setSuccess("Пароль успешно изменён. Выполняется выход...");
            setTimeout(async () => {
                try {
                    await logout();
                } catch (err) {
                    console.warn("logout after password change failed", err);
                }
                onClose();
                navigate("/login");
                if (onSuccess) onSuccess();
            }, 900);
        } catch (err: any) {
            console.error("changePassword error", err);
            setDetailError(err?.message || "Ошибка при смене пароля");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div
            ref={modalRef}
            onClick={onBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            role="dialog"
            aria-modal="true"
        >
            <div className="rounded-3xl relative w-full h-full bg-white md:h-auto shadow-lg p-6 md:mx-0 md:max-w-[600px] md:max-h-[80vh] overflow-auto">
                <div className="flex flex-row">
                    <h3 className="title">Смена пароля</h3>

                    <CloseButton close={onClose}/>

                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-9 md:gap-3">
                    <label className="flex flex-col gap-1 text-sm">
                        <span>Текущий пароль</span>
                        <input
                            className="input"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Введите текущий пароль"
                            required
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                        <span>Новый пароль</span>
                        <input
                            className="input"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Новый пароль"
                            minLength={MIN_PASSWORD_LENGTH}
                            required
                        />
                    </label>

                    {detailError && <span className="text-red-600 text-sm">{detailError}</span>}
                    {success && <span className="text-green-600 text-sm">{success}</span>}

                    <div className="flex items-center justify-center gap-3">
                        <button type="submit" className="big__button" disabled={loading} aria-busy={loading}>
                            {"Изменить"}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

function Profile(): JSX.Element {
    const { user} = useAuth();
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);

    if (!user) {
        return (
            <div className="p-9">
                <NavLink to="/login" className="big__button w-full">
                    Войти
                </NavLink>
            </div>
        );
    }

    return (
        <>
            <h1 className="title justify-start">Профиль</h1>

            <div className="card gap-9 items-center text-center">
                <div className="justify-center flex flex-row gap-1">
                    <p>{user.first_name}</p>
                    <p>{user.last_name}</p>
                </div>
                <p>{user.birthday}</p>
                <p>{user.email}</p>

                <div className="w-full max-w-md">
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            className="big__button bg-orange-400"
                            onClick={() => {
                                navigate("/orders");
                            }}
                        >
                            Мои заказы
                        </button>

                        <button type="button" onClick={() => setModalOpen(true)}
                                className="big__button bg-gray-500">
                            Сменить пароль
                        </button>

                        <ExitButton/>

                    </div>
                </div>
            </div>

            <ChangePasswordModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={() => {
                    window.location.assign("/login");
                }}
            />
        </>
    );
}

export default Profile;
