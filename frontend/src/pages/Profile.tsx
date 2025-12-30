import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import config from "../../config";
import CloseButton from "../components/Ui/CloseButton.tsx";
import ExitButton from "../components/Ui/ExitButton.tsx";
import ChangePasswordModal from "../components/Modals/ChangePassword.tsx";


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

            <div className="card p-18 gap-6 items-center text-center">
                <div>
                    <h1 className="title text-sm my-0">Имя и Фамилия:</h1>

                    <div className="flex flex-row gap-1">
                        <p>{user.first_name}</p>
                        <p>{user.last_name}</p>
                    </div>
                </div>
                <div>
                    <h1 className="title text-sm my-0">Дата рождения:</h1>

                    <p>{user.birthday ?? "Не указано"}</p>
                </div>

                <div>
                    <h1 className="title text-sm my-0">Почта:</h1>

                    <p>{user.email}</p>
                </div>


                <div className="w-full max-w-md">
                <div className="flex flex-col gap-1">
                        <button type="button" onClick={() => setModalOpen(true)}
                                className="big__button bg-blue-100 text-blue-500">
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
