import { createContext, useState, useEffect, useContext } from "react";
import type { EmployeeType } from "../type";
import { api } from "../api";

interface AuthState {
    user: EmployeeType | null;
    token: string | null;
    loading: boolean;
    login: ( id:string,password: string,) => Promise<void>;
    logout: () => void;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider')
    }
    return context as AuthState
}

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<EmployeeType | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const init = async () => {
            const saveToken = localStorage.getItem('token');
            if (saveToken) {
                setToken(saveToken);
                try {
                    const response = await api.getMe();
                    setUser(response);
                } catch (error) {
                    api.clearToken();
                    setToken(null);
                }
            }
            setLoading(false);
        };
        init();
    }, [token]);

    const value: AuthState = {
        user,
        token,
        loading,
        login: async (id: string, password: string) => {
            setLoading(true)
            const response = await api.login({ id, password })
            if (response.data) {
                api.setToken(response.data.token)
                setToken(response.data.token)
                setUser(response.data.user)
            }
            setLoading(false)
        },
        logout: () => {
            api.clearToken()
            setToken(null)
            setUser(null)
         }
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}