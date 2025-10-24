import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';

type Session = {
    userName?: string;
    // другие поля сессии
};

type AppContextType = {
    session: Session;
    resetSessionData: (newData: Partial<Session>) => void;
};

const AppCtx = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session>({});

    const resetSessionData = useCallback((newData: Partial<Session>) => {
        setSession(prev => ({ ...prev, ...newData }));
    }, []);

    return (
        <AppCtx.Provider value={{ session, resetSessionData }}>
    {children}
    </AppCtx.Provider>
);
}

export function useAppContext(): AppContextType {
    const ctx = useContext(AppCtx);
    if (!ctx) throw new Error('useAppContext must be used within AppProvider');
    return ctx;
}
