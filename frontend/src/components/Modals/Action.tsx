import React from "react";


type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (arg?: any) => void;
    confirmArg?: any;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
};


const ActionModal: React.FC<ConfirmModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       onConfirm,
                                                       confirmArg,
                                                       title = "Подтвердите действие",
                                                       message = "Вы уверены?",
                                                       confirmLabel = "Да",
                                                       cancelLabel = "Нет",
                                                   }) => {
    if (!isOpen) return null;


    const handleConfirm = () => {
        try {
            onConfirm(confirmArg);
        } finally {
            onClose();
        }
    };


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />


            <div className="flex flex-col gap-6 text-center relative z-50 w-full max-w-md rounded-2xl bg-white p-9  shadow-5xl">
                <h2 className="text-2xl font-semibold">
                    {title}
                </h2>

                <p className="p-6 leading-relaxed text-gray-600">{message}</p>


                <div className="flex justify-center gap-1">
                    <button
                        type="button"
                        className="big__button px-16 bg-red-100 text-red-500"
                        onClick={onClose}
                    >
                        {cancelLabel}
                    </button>


                    <button
                        type="button"
                        className="big__button bg-green-100 text-green-500"
                        onClick={handleConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ActionModal;