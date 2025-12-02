import { createContext, useContext, useState, useEffect } from 'react';
import { googleSheetsService } from '../services/googleSheetsService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persisted session (optional, skipping for simple MVP)
        const storedUser = localStorage.getItem('healingCookUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (id, password, branch) => {
        try {
            const user = await googleSheetsService.login(id, password, branch);
            setUser(user);
            localStorage.setItem('healingCookUser', JSON.stringify(user));
            return user;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('healingCookUser');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
