import { User } from "@/interfaces/types";
import { createContext, useContext, useState } from "react";

interface AuthContextType {
    user: User | null,
    login: (userData: User) => void,
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        console.log('logged out ')
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (context == null) {
        throw new Error('User must be logged In')
    }
    return context
};