import React, {useEffect, useRef, useState} from "react";
import {YMaps, Map, Placemark} from "@pbe/react-yandex-maps";

type Coords = [number, number];

export default function MapToPlace({
                                       destinationAddress = ""
                                   }: {
    destinationAddress: string;
}) {
    const mapRef = useRef<any>(null);
    const ymapsRef = useRef<any>(null);
    const multiRouteRef = useRef<any>(null);

    const [destCoords, setDestCoords] = useState<Coords | null>(null);
    const [userCoords, setUserCoords] = useState<Coords | null>(null);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
    const [mode, setMode] = useState<"auto" | "pedestrian">("auto");
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [geoDenied, setGeoDenied] = useState(false);
    const [permState, setPermState] = useState<string | null>(null);
    const [lastError, setLastError] = useState<string | null>(null);

    // --- onLoad карты: получаем ymaps и состояние permissions API (если доступно) ---
    function handleMapLoad(ymaps: any) {
        console.debug("ymaps loaded");
        ymapsRef.current = ymaps;
        if (navigator.permissions && typeof navigator.permissions.query === "function") {
            navigator.permissions.query({name: "geolocation" as PermissionName})
                .then(s => {
                    setPermState(s.state);
                    s.onchange = () => setPermState((s as any).state);
                })
                .catch(() => {
                });
        }
    }

    // --- Геокодим адрес (после того как ymaps готов) ---
    useEffect(() => {
        async function geocode() {
            setLastError(null);
            if (!destinationAddress) {
                console.debug("No destinationAddress provided");
                setDestCoords(null);
                return;
            }
            if (!ymapsRef.current) {
                console.debug("ymaps not ready yet — waiting for onLoad");
                return;
            }
            try {
                console.debug("Geocoding:", destinationAddress);
                // results:1 чтобы получить первый наиболее релевантный
                const res = await ymapsRef.current.geocode(destinationAddress, {results: 1});
                const first = res.geoObjects.get(0);
                if (!first) {
                    console.warn("Geocode: no result for", destinationAddress);
                    setLastError("Адрес не найден (geocode вернул пусто)");
                    setDestCoords(null);
                    return;
                }
                const coords = first.geometry.getCoordinates() as Coords;
                console.debug("Geocode coords:", coords);
                setDestCoords(coords);
                // если карта есть — центрируем и ставим зум
                try {
                    mapRef.current?.setCenter(coords, 14, {duration: 300});
                } catch (e) {
                }
            } catch (err: any) {
                console.error("Geocode error:", err);
                setLastError("Ошибка геокодирования: " + (err?.message ?? err));
                setDestCoords(null);
            }
        }

        geocode();
    }, [destinationAddress, ymapsRef.current]);

    function requestUserLocation() {
        setLastError(null);
        if (!navigator.geolocation) {
            setLastError("Геолокация не поддерживается в этом браузере");
            return;
        }

        if (navigator.permissions && typeof navigator.permissions.query === "function") {
            navigator.permissions.query({name: "geolocation" as PermissionName})
                .then((p) => {
                    setPermState(p.state);
                    if (p.state === "denied") {
                        setGeoDenied(true);
                        setLastError("Доступ к геопозиции запрещён в настройках браузера");
                        return;
                    }
                    doGetPosition();
                })
                .catch(() => {
                    doGetPosition();
                });
        } else {
            doGetPosition();
        }

        function doGetPosition() {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords: Coords = [pos.coords.latitude, pos.coords.longitude];
                    console.debug("User coords (getCurrentPosition):", coords);
                    setUserCoords(coords);
                    setGeoDenied(false);
                    try {
                        mapRef.current?.setCenter(coords, 13, {duration: 300});
                    } catch (e) {
                    }
                },
                (err) => {
                    console.warn("getCurrentPosition error:", err);
                    if (err.code === 1) {
                        setGeoDenied(true);
                        setLastError("Доступ к геопозиции запрещён пользователем/браузером");
                    } else if (err.code === 3) {
                        setLastError("Таймаут при получении геопозиции");
                        // Попробуем watchPosition как fallback
                        tryWatchPositionFallback();
                    } else {
                        setLastError("Ошибка получения геопозиции: " + (err.message ?? err.code));
                    }
                },
                {enableHighAccuracy: true, maximumAge: 0, timeout: 10000}
            );
        }

        function tryWatchPositionFallback() {
            let watchId: number | null = null;
            if (!navigator.geolocation) return;
            try {
                watchId = navigator.geolocation.watchPosition(
                    (pos) => {
                        const coords: Coords = [pos.coords.latitude, pos.coords.longitude];
                        console.debug("User coords (watchPosition fallback):", coords);
                        setUserCoords(coords);
                        if (watchId !== null) {
                            navigator.geolocation.clearWatch(watchId);
                        }
                    },
                    (err) => {
                        console.warn("watchPosition error:", err);
                        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
                    },
                    {enableHighAccuracy: true, maximumAge: 0}
                );
            } catch (e) {
                console.error("watchPosition not available", e);
            }
        }
    }

    function chooseShortestAndSetActive(multiRoute: any) {
        try {
            const routes = multiRoute.getRoutes ? multiRoute.getRoutes() : null;
            const len = routes && typeof routes.getLength === "function" ? routes.getLength() : 0;
            if (!routes || len === 0) {
                const active = multiRoute.getActiveRoute && multiRoute.getActiveRoute();
                if (active) {
                    setRouteInfo({
                        distance: active.properties.get("distance")?.text ?? "",
                        duration: active.properties.get("duration")?.text ?? ""
                    });
                }
                return;
            }

            let best: any = null;
            let bestValue = Infinity;
            for (let i = 0; i < len; i++) {
                const r = routes.get(i);
                const durationVal = r.properties.get("duration")?.value ?? Infinity;
                if (durationVal < bestValue) {
                    bestValue = durationVal;
                    best = r;
                }
            }
            if (best) {
                try {
                    multiRoute.setActiveRoute(best);
                } catch (e) {
                    console.warn("setActiveRoute failed", e);
                }
                setRouteInfo({
                    distance: best.properties.get("distance")?.text ?? "",
                    duration: best.properties.get("duration")?.text ?? ""
                });
            }
        } catch (e) {
            console.error("chooseShortestAndSetActive error", e);
        }
    }

    useEffect(() => {
        const ym = ymapsRef.current;
        const map = mapRef.current;
        if (!ym || !map) {
            return;
        }

        if (!userCoords || !destCoords) {
            if (multiRouteRef.current) {
                try {
                    map.geoObjects.remove(multiRouteRef.current);
                } catch (e) {
                }
                multiRouteRef.current = null;
            }
            setRouteInfo(null);
            setLoadingRoute(false);
            return;
        }

        setLoadingRoute(true);
        setRouteInfo(null);
        setLastError(null);

        if (multiRouteRef.current) {
            try {
                map.geoObjects.remove(multiRouteRef.current);
            } catch (e) {
            }
            multiRouteRef.current = null;
        }

        let multiRoute: any;
        try {
            multiRoute = new ym.multiRouter.MultiRoute(
                {
                    referencePoints: [userCoords, destCoords],
                    params: {routingMode: mode === "auto" ? "auto" : "pedestrian", results: 3}
                },
                {boundsAutoApply: true, activeRouteAutoSelection: true}
            );
        } catch (err) {
            console.error("Failed to create MultiRoute:", err);
            setLastError("Ошибка создания маршрута: " + String(err));
            setLoadingRoute(false);
            return;
        }

        multiRouteRef.current = multiRoute;

        const onSuccess = () => {
            try {
                chooseShortestAndSetActive(multiRoute);
            } catch (e) {
                console.error("onSuccess chooseShortest error", e);
            } finally {
                setLoadingRoute(false);
            }
        };
        const onFail = (e: any) => {
            console.warn("MultiRoute requestfail", e);
            setLastError("Не удалось построить маршрут");
            setLoadingRoute(false);
        };

        multiRoute.model.events.add("requestsuccess", onSuccess);
        multiRoute.model.events.add("requestfail", onFail);

        try {
            map.geoObjects.add(multiRoute);
        } catch (e) {
            console.error("map.geoObjects.add error", e);
        }

        return () => {
            try {
                multiRoute.model.events.remove("requestsuccess", onSuccess);
            } catch (e) {
            }
            try {
                multiRoute.model.events.remove("requestfail", onFail);
            } catch (e) {
            }
            try {
                if (map && multiRouteRef.current) map.geoObjects.remove(multiRouteRef.current);
            } catch (e) {
            }
            multiRouteRef.current = null;
        };
    }, [userCoords, destCoords, mode, ymapsRef.current, mapRef.current]);

    return (
        <div className="w-full h-full">

            <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden bg-gray-100">
                <YMaps
                    query={{
                        apikey: "1460e5e2-39ad-4ee0-b416-2ed00dac917d",
                        lang: "ru_RU",
                        load: "package.full"
                    }}
                >
                    <Map
                        instanceRef={mapRef}
                        onLoad={handleMapLoad}
                        className="w-full h-full"
                        defaultState={{center: [55.751574, 37.573856], zoom: 13}}
                    >
                        {destCoords && (
                            <Placemark
                                geometry={destCoords}
                                options={{preset: "islands#redIcon"}}
                            />
                        )}
                        {userCoords && (
                            <Placemark
                                geometry={userCoords}
                                options={{preset: "islands#blueCircleIcon"}}
                            />
                        )}
                    </Map>
                </YMaps>
            </div>


        </div>

    );
}
