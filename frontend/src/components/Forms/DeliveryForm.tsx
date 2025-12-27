import type {DeliveryAddress} from "../Widgets/Cart.tsx";
import {useCallback, useEffect, useRef, useState} from "react";
import CloseButton from "../Ui/CloseButton.tsx";
import plusSvg from "../../assets/plus.svg";
import editSvg from "../../assets/editing.png";
import deleteSvg from "../../assets/delete.svg";
import ToggleSwitch from "../Ui/ToggleSwitch.tsx";
import BackButton from "../Ui/BackButton.tsx";
import config from "../../../config.ts";

type DFProps = {
    value?: DeliveryAddress;
    onChange?: (addr: DeliveryAddress) => void;
    addresses: DeliveryAddress[];
    fetchAddresses: (signal?: AbortSignal) => Promise<void>;
    selectedAddress: DeliveryAddress | null;
    setSelectedAddress: (a: DeliveryAddress | null) => void;
    onSaved?: (a: DeliveryAddress) => void;
    onClose?: () => void;
    submitLabel?: string;
    className?: string;
};

type Errors = Partial<Record<keyof DeliveryAddress, string | null>>;

const NO_VALUES = new Set([
    "нет",
    "no",
    "none",
    "-",
    "n",
    "нету",
    "нет ",
    "нету ",
    "none ",
]);

const isNoValue = (raw?: string) => {
    if (!raw) return false;
    return NO_VALUES.has(raw.trim().toLowerCase());
};

const onlyDigits = (s?: string) => {
    if (!s) return false;
    return /^\d+$/.test(s.trim());
};

const DeliveryForm: React.FC<DFProps> = ({
                                             value,
                                             onChange,
                                             addresses,
                                             fetchAddresses,
                                             selectedAddress,
                                             setSelectedAddress,
                                             onSaved,
                                             onBack, onClose,
                                             submitLabel = "Далее",
                                             className = "",
                                         }) => {
    const [addr, setAddr] = useState<DeliveryAddress>(() => value ?? {leaveAtDoor: false});
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [deletingId, setDeletingId] = useState<number | string | null>(null);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
    const [showForm, setShowForm] = useState(false);
    const alphaRegex = /^[A-Za-zА-Яа-яЁё \-]+$/;
    const numericRegex = /^\d+$/;

    useEffect(() => {
        if (value) {
            setAddr(value);
        }
    }, [value]);

    useEffect(() => {
        (async () => {
            await fetchAddresses();
        })();
    }, [])


    useEffect(() => {
        if (selectedAddress) {
            setAddr(selectedAddress);
        }
    }, [selectedAddress]);

    useEffect(() => {
        setFocusedIndex(-1);
        optionRefs.current = [];
    }, [addresses]);

    const update = useCallback(
        (patch: Partial<DeliveryAddress>) => {
            setAddr((prev) => {
                const next = {...prev, ...patch};
                onChange?.(next);
                return next;
            });

            for (const k of Object.keys(patch) as (keyof DeliveryAddress)[]) {
                const v = (patch as any)[k];
                const err = validateField(k, v ?? (addr as any)[k]);
                setErrors((prev) => ({...prev, [k]: err}));
            }
        },
        [onChange, addr]
    );

    const validateField = (field: keyof DeliveryAddress, value?: any): string | null => {
        const raw = typeof value === "string" ? value.trim() : value;

        switch (field) {
            case "addressLine":
            case "street": {
                if (!raw) return "Поле обязательно";
                if (!alphaRegex.test(String(raw))) return "Только буквы, пробелы и дефис";
                return null;
            }

            case "house": {
                if (!raw) return null;
                if (!numericRegex.test(String(raw))) return "Только цифры";
                return null;
            }
            case "flat":
            case "floor": {
                if (!raw) return null;
                if (!numericRegex.test(String(raw))) return "Только цифры";
                return null;
            }

            case "intercom": {
                if (!raw) return null;
                if (isNoValue(String(raw))) return null;
                if (!onlyDigits(String(raw))) return 'Только цифры или "нет"';
                return null;
            }

            case "comment":
            case "leaveAtDoor":
                return null;

            default:
                return null;
        }
    };

    const validateAll = (): boolean => {
        const next: Errors = {};

        const required: (keyof DeliveryAddress)[] = ["addressLine", "street"];
        required.forEach((f) => {
            const err = validateField(f, (addr as any)[f]);
            if (err) next[f] = err;
        });

        const numeric: (keyof DeliveryAddress)[] = ["house", "flat", "floor", "intercom"];
        numeric.forEach((f) => {
            const err = validateField(f, (addr as any)[f]);
            if (err) next[f] = err;
        });

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const buildCreateDTO = (a: DeliveryAddress) => {
        const entrance = !a.intercom || isNoValue(a.intercom) ? null : a.intercom ? Number(a.intercom) : null;

        return {
            city: a.addressLine ?? "",
            street: a.street ?? "",
            house_number: a.house ? Number(a.house) : null,
            entrance: entrance,
            floor: a.floor ? Number(a.floor) : null,
            apartment_number: a.flat ? Number(a.flat) : null,
            comment: a.comment ?? null,
            is_leave_at_door: a.leaveAtDoor ?? null,
        };
    };

    const buildUpdateDTO = (a: DeliveryAddress) => {
        const entrance = !a.intercom || isNoValue(a.intercom) ? null : a.intercom ? Number(a.intercom) : null;

        return {
            id: a.id ?? null,
            city: a.addressLine ?? null,
            street: a.street ?? null,
            house_number: a.house ? Number(a.house) : null,
            entrance: entrance,
            floor: a.floor ? Number(a.floor) : null,
            apartment_number: a.flat ? Number(a.flat) : null,
            comment: a.comment ?? null,
            is_leave_at_door: a.leaveAtDoor ?? null,
        };
    };


    const handleAddressSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!validateAll()) return;

        setLoadingSubmit(true);
        try {
            let savedAddr: DeliveryAddress | null = null;
            if (!addr.id) {
                const body = buildCreateDTO(addr);
                const res = await fetch(config.API_URL + "/api/addresses/", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify(body),
                });
                if (!res.ok) {
                    let message = `Ошибка создания адреса: ${res.status}`;
                    try {
                        const json = await res.json();
                        message = json?.detail || json?.message || message;
                    } catch {
                    }
                    throw new Error(message);
                }
                const created = await res.json();
                savedAddr = {
                    ...addr,
                    id: created.id,
                };
            } else {
                const body = buildUpdateDTO(addr);
                const res = await fetch(`/api/addresses/${addr.id}`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(body),
                });
                if (!res.ok) {
                    let message = `Ошибка обновления адреса: ${res.status}`;
                    try {
                        const json = await res.json();
                        message = json?.detail || json?.message || message;
                    } catch {
                    }
                    throw new Error(message);
                }
                savedAddr = addr;
            }

            await fetchAddresses();

            if (savedAddr) {
                setSelectedAddress(savedAddr);
                onSaved?.(savedAddr);
            }

            setShowForm(false);
        } catch (err) {
            console.error(err);
            alert((err as Error).message || "Ошибка при сохранении адреса");
        } finally {
            setLoadingSubmit(false);
        }
    };

    const onBlurValidate = (field: keyof DeliveryAddress) => {
        const err = validateField(field, (addr as any)[field]);
        setErrors((prev) => ({...prev, [field]: err}));
    };

    const selectAddress = (a: DeliveryAddress) => {
        setAddr(a);
        setSelectedAddress(a);
        setShowForm(false);
    };

    const startEdit = (a: DeliveryAddress) => {
        setAddr(a);
        setShowForm(true);
    };

    const startCreate = () => {
        setAddr({leaveAtDoor: false});
        setShowForm(!showForm);
    };

    const handleDeleteAddress = async (id?: number | string) => {
        if (!id) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/addresses/${id}`, {method: "DELETE"});
            if (!res.ok) {
                throw new Error(`Ошибка удаления: ${res.status}`);
            }
            if (String(selectedAddress?.id) === String(id)) {
                setAddr({leaveAtDoor: false});
                setSelectedAddress(null);
            }
            await fetchAddresses();
        } catch (e) {
            console.error(e);
            alert("Не удалось удалить адрес");
        } finally {
            setDeletingId(null);
        }
    };

    const handleListboxKeyDown = (e: React.KeyboardEvent) => {
        if (!addresses || addresses.length === 0) return;
        const last = addresses.length - 1;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = focusedIndex < last ? focusedIndex + 1 : 0;
            setFocusedIndex(next);
            optionRefs.current[next]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = focusedIndex > 0 ? focusedIndex - 1 : last;
            setFocusedIndex(prev);
            optionRefs.current[prev]?.focus();
        } else if (e.key === 'Home') {
            e.preventDefault();
            setFocusedIndex(0);
            optionRefs.current[0]?.focus();
        } else if (e.key === 'End') {
            e.preventDefault();
            setFocusedIndex(last);
            optionRefs.current[last]?.focus();
        }
    };


    return (
        <div className={`w-full h-full ${className}`}>
            <form
                onSubmit={handleAddressSubmit}
                className="h-full flex flex-col bg-white rounded-xl text-base"
            >
                <div className="flex items-center justify-between p-3">
                    <h3 className="font-semibold text-2xl">Адрес доставки</h3>
                    <CloseButton close={onClose}/>
                </div>

                <div className="flex-1 min-h-0 overflow-auto p-4 sm:p-6 space-y-3">
                    <div className="bg-gray-50 p-3 rounded-md">
                        {addresses.length === 0 ? (
                            <div className="flex justify-center py-6">
                                <button
                                    type="button"
                                    onClick={startCreate}
                                    className="big__button bg-gray-200"
                                    aria-label="Добавить адрес"
                                >
                                    <img src={plusSvg}
                                         className="w-5"
                                         alt="Добавить"/>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-row gap-3">
                                <div
                                    role="listbox"
                                    tabIndex={0}
                                    onKeyDown={handleListboxKeyDown}
                                    aria-label="Сохранённые адреса"
                                    className="flex flex-col flex-1"
                                >
                                    {addresses.map((a, idx) => (
                                        <div
                                            key={String(a.id)}
                                            role="option"
                                            aria-selected={String(selectedAddress?.id) === String(a.id)}
                                            tabIndex={0}
                                            onClick={() => selectAddress(a)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    selectAddress(a);
                                                }
                                            }}
                                            className={`w-full p-4 rounded-2xl flex gap-4 ${String(selectedAddress?.id) === String(a.id) ? 'border-blue-200 bg-blue-50' : ''}`}>
                                            <input
                                                type="radio"
                                                name="saved-address"
                                                checked={String(selectedAddress?.id) === String(a.id)}
                                                onChange={() => selectAddress(a)}
                                                className="items-center justify-center text-center my-auto my-24"
                                                aria-label={`Выбрать адрес ${a.addressLine || ''} ${a.street || ''}`}
                                            />

                                            <div className="flex-1">
                                                <div className="font-medium">
                                                    {a.addressLine} {a.street ? ` ${a.street}` : ""} {a.house ? `д. ${a.house}` : ""}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {a.flat ? `Кв. ${a.flat}` : ""} {a.floor ? `этаж ${a.floor}` : ""} {a.intercom ? ` домофон ${a.intercom}` : ""}
                                                </div>
                                                {a.comment ? <div className="text-xs text-gray-400 mt-1">{a.comment}</div> : null}
                                            </div>

                                            <div className="flex flex-col items-end gap-3">
                                                <button
                                                    type="button"
                                                    disabled={String(deletingId) === String(a.id)}
                                                    onClick={(ev) => {
                                                        ev.stopPropagation();
                                                        handleDeleteAddress(a.id);
                                                    }}
                                                    className="menu__button"
                                                    aria-label={`Удалить адрес ${a.addressLine || ''}`}
                                                >
                                                    {String(deletingId) === String(a.id) ?
                                                        (<span aria-hidden>⏳</span>) :
                                                        (<img src={deleteSvg}
                                                              className="w-5"
                                                              alt="Удалить"/>)
                                                    }
                                                    <span className="sr-only">Удалить</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(ev) => {
                                                        ev.stopPropagation();
                                                        startEdit(a);
                                                    }}
                                                    className="menu__button"
                                                    aria-label={`Редактировать адрес ${a.addressLine || ''}`}
                                                >
                                                    <img src={editSvg}
                                                         alt="Редактировать"
                                                         className="w-5"/>
                                                    <span className="sr-only">Редактировать</span>
                                                </button>

                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={startCreate}
                                    className="big__button w-12 h-12 bg-gray-200 ml-auto"
                                    aria-label="Добавить адрес"
                                >
                                    <img src={plusSvg}
                                         className="w-5"
                                         alt="Добавить"/>
                                </button>
                            </div>
                        )}

                    </div>

                    {showForm ? (
                        <>
                            <div>
                                <div className="flex flex-row gap-2">
                                    <label className="sr-only" htmlFor="city">Город</label>
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        value={addr.addressLine ?? ""}
                                        onChange={(e) => update({addressLine: e.target.value})}
                                        onBlur={() => onBlurValidate("addressLine")}
                                        placeholder="Город"
                                        className={`input text-sm sm:text-base ${errors.addressLine ? "border-red-300" : ""}`}
                                        aria-invalid={!!errors.addressLine}
                                    />
                                    {errors.addressLine ? <div className="text-xs text-red-600 mt-1">{errors.addressLine}</div> : null}

                                    <label className="sr-only" htmlFor="street">Улица</label>
                                    <input
                                        id="street"
                                        name="street"
                                        type="text"
                                        value={addr.street ?? ""}
                                        onChange={(e) => update({street: e.target.value})}
                                        onBlur={() => onBlurValidate("street")}
                                        placeholder="Улица"
                                        className={`input text-sm sm:text-base ${errors.street ? "border-red-300" : ""}`}
                                        aria-invalid={!!errors.street}
                                    />
                                    {errors.street ? <div className="text-xs text-red-600 mt-1">{errors.street}</div> : null}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <label className="sr-only" htmlFor="house">Номер дома</label>
                                <input
                                    id="house"
                                    name="house"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    type="text"
                                    value={addr.house ?? ""}
                                    onChange={(e) => update({house: e.target.value.replace(/[^\d]/g, "")})}
                                    onBlur={() => onBlurValidate("house")}
                                    placeholder="Номер дома"
                                    className={`input text-sm sm:text-base ${errors.house ? "border-red-300" : ""}`}
                                    aria-invalid={!!errors.house}
                                />
                                {errors.house ? <div className="text-xs text-red-600 mt-1">{errors.house}</div> : null}

                                <label className="sr-only" htmlFor="flat">Номер квартиры</label>
                                <input
                                    id="flat"
                                    name="flat"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    type="text"
                                    value={addr.flat ?? ""}
                                    onChange={(e) => update({flat: e.target.value.replace(/[^\d]/g, "")})}
                                    onBlur={() => onBlurValidate("flat")}
                                    placeholder="Номер квартиры"
                                    className={`input text-sm sm:text-base ${errors.flat ? "border-red-300" : ""}`}
                                    aria-invalid={!!errors.flat}
                                />
                                {errors.flat ? <div className="text-xs text-red-600 mt-1">{errors.flat}</div> : null}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <label className="sr-only" htmlFor="intercom">Домофон</label>
                                    <input
                                        id="intercom"
                                        name="intercom"
                                        type="text"
                                        value={addr.intercom ?? ""}
                                        onChange={(e) => update({intercom: e.target.value})}
                                        onBlur={() => onBlurValidate("intercom")}
                                        placeholder='Домофон (цифра или "нет")'
                                        className={`input text-sm sm:text-base ${errors.intercom ? "border-red-300" : ""}`}
                                        aria-invalid={!!errors.intercom}
                                    />
                                    {errors.intercom ? <div className="text-xs text-red-600 mt-1">{errors.intercom}</div> : null}
                                </div>

                                <div>
                                    <label className="sr-only" htmlFor="floor">Этаж</label>
                                    <input
                                        id="floor"
                                        name="floor"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        type="text"
                                        value={addr.floor ?? ""}
                                        onChange={(e) => update({floor: e.target.value.replace(/[^\d]/g, "")})}
                                        onBlur={() => onBlurValidate("floor")}
                                        placeholder="Этаж"
                                        className={`input text-sm sm:text-base ${errors.floor ? "border-red-300" : ""}`}
                                        aria-invalid={!!errors.floor}
                                    />
                                    {errors.floor ? <div className="text-xs text-red-600 mt-1">{errors.floor}</div> : null}
                                </div>
                            </div>

                            <div>
                                <label className="sr-only" htmlFor="comment">Комментарий</label>
                                <input
                                    id="comment"
                                    name="comment"
                                    type="text"
                                    value={addr.comment ?? ""}
                                    onChange={(e) => update({comment: e.target.value})}
                                    placeholder="Комментарий для курьера"
                                    className="input text-sm sm:text-base min-h-30"
                                />
                            </div>

                            <ToggleSwitch
                                checked={!!addr.leaveAtDoor}
                                onCheckedChange={(v) => update({leaveAtDoor: v})}
                                label="Оставить у двери"
                            />

                        </>
                    ) : (
                        <div className="justify-center items-center">
                            {addr && addr.addressLine ? (
                                <div className="text-gray-700">
                                    Выбран адрес: <span
                                    className="font-medium">{addr.addressLine}{addr.street ? `, ${addr.street}` : ""}{addr.house ? `, д. ${addr.house}` : ""}</span>
                                </div>
                            ) : null}
                        </div>
                    )}


                </div>

                <div className="sticky bottom-0 bg-white p-2 sm:p-4 flex flex-col gap-1">
                    <button
                        type="submit"
                        disabled={loadingSubmit || !(showForm || (addr.addressLine && addr.street))}
                        className={`big__button btn__circle flex-1 ${loadingSubmit ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        {submitLabel}
                    </button>


                    <BackButton onBack={onBack}/>
                </div>
            </form>
        </div>
    );
};

export {DeliveryForm};