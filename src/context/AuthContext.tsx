import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import type {User} from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => Promise<boolean>; // 👈 возвращает результат
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: async () => false,
    logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const res = await api.get(API.AUTH.PROFILE);
            setUser(res.data);
        } catch (err) {
            throw new Error('Invalid token');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchProfile().catch(() => {
                localStorage.removeItem('token');
                delete api.defaults.headers.common['Authorization'];
                setUser(null);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (token: string): Promise<boolean> => {
        try {
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsLoading(true);
            await fetchProfile();
            return true;
        } catch (err) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
