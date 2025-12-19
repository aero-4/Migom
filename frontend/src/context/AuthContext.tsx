import React, {useState, useEffect, useRef, createContext, useContext, use} from "react";
import config from "../../config";

const AuthContext = createContext<any | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const refreshIntervalRef = useRef<number | null>(null);

    const handleNotAuthenticated = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    const fetchCurrentUser = async () => {
        setLoading(true);
        try {
            const res = await fetch(config.API_URL + "/api/users/me", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json",
                }
            });

            const json = await res.json().catch(() => null);

            if (!res.ok) {
                if (json && (json.detail === "Not authenticated" || res.status === 401)) {
                    handleNotAuthenticated();
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(json);
                setIsAuthenticated(true);
            }
        } catch (err) {
            console.error("fetchCurrentUser error", err);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async () => {
        try {
            const res = await fetch(config.API_URL + "/api/auth/refresh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const json = await res.json().catch(() => null);

            if (!res.ok) {
                if (json && (json.detail === "Not authenticated" || res.status === 401)) {
                    handleNotAuthenticated();
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
                return;
            }

            await fetchCurrentUser();
        } catch (err) {
            console.error("refreshToken error", err);
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            refreshToken();
            refreshIntervalRef.current = window.setInterval(() => {
                refreshToken();
            }, 15 * 60 * 1000);
        } else {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }
        }
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }
        };
    }, [isAuthenticated]);

    const login = async ({ email, password }: { email: string; password: string }) => {
        try {
            const res = await fetch(config.API_URL + "/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const json = await res.json().catch(() => null);

            if (!res.ok) {
                const msg = (json && (json.detail || json.error || json.message)) || `Ошибка: ${res.status}`;
                return { ok: false, message: msg };
            }

            setIsAuthenticated(true);
            await fetchCurrentUser();
            return { ok: true };
        } catch (err: any) {
            return { ok: false, message: err?.message || "Ошибка при входе" };
        }
    };

    const logout = async () => {
        try {
            await fetch(config.API_URL + "/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (e) {
            console.warn("logout error", e);
        }
        setUser(null);
        setIsAuthenticated(false);
        window.location.assign("/")
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                login,
                logout,
                refresh: fetchCurrentUser,
                setAuthenticated: setIsAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
