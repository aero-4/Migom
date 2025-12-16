import React, {useState} from 'react';
import {useAuth} from "../../context/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import ActionModal from "../Modals/Action.tsx";

function ExitButton() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const handelExitAction = async () => {
        await logout();
        navigate("/login");
    }
    return (
        <>
            <button
                type="button"
                className="big__button text-red-500 bg-red-100"
                onClick={() => setIsOpen(true)}
            >
                Выйти
            </button>

            <ActionModal isOpen={isOpen}
                onConfirm={handelExitAction}
                onClose={() => setIsOpen(false)}
                message="Вы действительно хотите выйти?!"
            />
        </>

    );
}

export default ExitButton;