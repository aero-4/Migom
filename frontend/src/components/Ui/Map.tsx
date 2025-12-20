import React, { useEffect, useRef, useState } from "react";
import { YMaps, Map, Placemark, RoutePanel } from "@pbe/react-yandex-maps";

const DEFAULT_CENTER = [55.751574, 37.573856]; // запасной центр (Москва)

export default function MapToPlace({ destinationAddress: initialAddress = "" }) {
    const [addressInput, setAddressInput] = useState(initialAddress);
    const [resolvedAddress, setResolvedAddress] = useState(""); // адрес из геокодера
    const [destCoords, setDestCoords] = useState(null); // [lat, lon]
    const [userPos, setUserPos] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null); // { durationText, distanceText }
    const [mode, setMode] = useState("auto"); // 'auto' или 'pedestrian'
    const [zoom, setZoom] = useState(14);

    // Получаем текущее местоположение
    useEffect(() => {
        if (!navigator.geolocation) return;
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setUserPos([pos.coords.latitude, pos.coords.longitude]);
            },
            (err) => {
                console.debug("geolocation error:", err);
            },
            { enableHighAccuracy: true, maximumAge: 5000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Если компонент получил адрес через проп при старте — сразу решаем его
    useEffect(() => {
        if (initialAddress) {
            setAddressInput(initialAddress);
            // автоматический поиск
            geocodeAddress(initialAddress);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialAddress]);

    // Хелпер: ждём появления window.ymaps, затем геокодируем
    function waitForYmapsThen(fn) {
        if (window.ymaps) {
            fn();
            return;
        }
        const timer = setInterval(() => {
            if (window.ymaps) {
                clearInterval(timer);
                fn();
            }
        }, 100);
        // return cleanup not needed here
    }

    // Геокодирование адреса -> coords + resolvedAddress
    function geocodeAddress(addr) {
        if (!addr || addr.trim().length === 0) {
            setResolvedAddress("");
            setDestCoords(null);
            return;
        }

        waitForYmapsThen(() => {
            window.ymaps.geocode(addr, { results: 1 })
                .then((res) => {
                    const first = res.geoObjects.get(0);
                    if (!first) {
                        setResolvedAddress("Адрес не найден");
                        setDestCoords(null);
                        setRouteInfo(null);
                        return;
                    }
                    const coords = first.geometry.getCoordinates();
                    const addrLine = first.getAddressLine();
                    setDestCoords(coords);
                    setResolvedAddress(addrLine || addr);
                    // как только есть и пользователь и цель — пересчитываем маршрут (внизу)
                    if (userPos) computeRoute(userPos, coords, mode);
                })
                .catch((err) => {
                    console.error("geocode error:", err);
                    setResolvedAddress("Ошибка геокодирования");
                    setDestCoords(null);
                    setRouteInfo(null);
                });
        });
    }

    // Вычисляем время/расстояние маршрута программно через ymaps.route (показ внизу)
    function computeRoute(fromCoords, toCoords, transportMode = "auto") {
        if (!window.ymaps || !fromCoords || !toCoords) {
            setRouteInfo(null);
            return;
        }

        const routingMode = transportMode === "pedestrian" ? "pedestrian" : "auto";

        // ymaps.route может принимать массив координат [from, to]
        window.ymaps.route([fromCoords, toCoords], { routingMode })
            .then((multiRoute) => {
                // Попробуем извлечь основную информацию о первом активном/первом маршруте
                try {
                    // структура: multiRoute.getRoutes()[0].properties.get('distance') / get('duration')
                    const routes = multiRoute.getRoutes ? multiRoute.getRoutes() : null;
                    const firstRoute = routes && routes[0] ? routes[0] : (multiRoute.geoObjects && multiRoute.geoObjects.get(0));
                    const props = firstRoute && firstRoute.properties;
                    const distance = props && (props.get("distance")?.text || props.get("distance"));
                    const duration = props && (props.get("duration")?.text || props.get("duration"));
                    setRouteInfo({
                        distanceText: distance || null,
                        durationText: duration || null,
                    });
                } catch (err) {
                    // если структура другая, просто не показываем детальную инфу
                    console.debug("route parse error:", err);
                    setRouteInfo(null);
                }
            })
            .catch((err) => {
                console.error("route error:", err);
                setRouteInfo(null);
            });
    }

    // Пересчитать маршрут, когда меняются userPos / destCoords / mode
    useEffect(() => {
        if (userPos && destCoords) {
            computeRoute(userPos, destCoords, mode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userPos, destCoords, mode]);

    // UI handlers
    function onFindClick(e) {
        e?.preventDefault();
        geocodeAddress(addressInput);
    }

    return (
        <YMaps query={{ apikey: "1460e5e2-39ad-4ee0-b416-2ed00dac917d" }}>
            <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8 }}>
                        <form onSubmit={(e) => { e.preventDefault(); geocodeAddress(addressInput); }}>
                            <input
                                value={addressInput}
                                onChange={(e) => setAddressInput(e.target.value)}
                                placeholder="Введите адрес назначения (например: Красная площадь, Москва)"
                                style={{ width: "70%", padding: 8 }}
                            />
                            <button onClick={onFindClick} style={{ marginLeft: 8, padding: "8px 12px" }}>
                                Найти
                            </button>
                        </form>
                        <div style={{ marginTop: 8 }}>
                            Режим:{" "}
                            <select value={mode} onChange={(e) => setMode(e.target.value)}>
                                <option value="auto">Авто</option>
                                <option value="pedestrian">Пешком</option>
                            </select>
                            <span style={{ marginLeft: 16 }}>
                Масштаб:{" "}
                                <button onClick={() => setZoom((z) => Math.max(3, z - 1))}>−</button>
                <span style={{ margin: "0 8px" }}>{zoom}</span>
                <button onClick={() => setZoom((z) => Math.min(19, z + 1))}>+</button>
              </span>
                        </div>
                    </div>

                    <div style={{ width: "100%", height: 480, border: "1px solid #ddd" }}>
                        <Map
                            // используем state (чтобы центр следовал за destCoords)
                            state={{
                                center: destCoords || DEFAULT_CENTER,
                                zoom,
                                controls: ["zoomControl"],
                            }}
                            width="100%"
                            height="100%"
                        >
                            {/* метка назначения (если есть coords) */}
                            {destCoords && <Placemark geometry={destCoords} options={{ preset: "islands#redDotIcon" }} />}

                            {/* метка текущего положения */}
                            {userPos && <Placemark geometry={userPos} options={{ preset: "islands#blueCircleIcon" }} />}

                            {/* RoutePanel — даст пользователю удобную панель с маршрутом и временем */}
                            {userPos && (destCoords || addressInput) && (
                                <RoutePanel
                                    options={{ float: "right" }}
                                    state={{
                                        from: userPos,
                                        to: destCoords || addressInput,
                                        type: mode === "pedestrian" ? "pedestrian" : "auto",
                                    }}
                                />
                            )}
                        </Map>
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <b>Результат геокодирования:</b> {resolvedAddress || "не найдено"}
                    </div>
                    <div>
                        <b>Текущие геоданные:</b>{" "}
                        {userPos ? `${userPos[0].toFixed(6)}, ${userPos[1].toFixed(6)}` : "не получены (прошение геолокации)"}
                    </div>
                    <div>
                        <b>Информация о маршруте:</b>{" "}
                        {routeInfo ? `${routeInfo.durationText || ""} ${routeInfo.distanceText ? `· ${routeInfo.distanceText}` : ""}` : "не рассчитан"}
                    </div>
                </div>

                <div style={{ width: 320 }}>
                    <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
                        <h4>Короткая справка</h4>
                        <ul>
                            <li>Передавай адрес в пропе <code>destinationAddress</code> или вводи в поле.</li>
                            <li>Нажми «Найти», чтобы геокодер преобразовал адрес в координаты.</li>
                            <li>Если пользователь разрешил — отображается его текущее положение и маршрут.</li>
                            <li>RoutePanel показывает более подробную панель маршрута (время/маршрут/альтернативы).</li>
                        </ul>
                        <div style={{ marginTop: 8 }}>
                            Пример вызова:
                            <pre style={{ background: "#fafafa", padding: 8 }}>{"<MapToPlace destinationAddress=\"Невский проспект, Санкт-Петербург\" />"}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </YMaps>
    );
}
