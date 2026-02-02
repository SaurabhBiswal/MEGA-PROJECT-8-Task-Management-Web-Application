import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginAPI, register as registerAPI, getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const checkLoggedIn = async () => {
            const token = sessionStorage.getItem('token');
            if (token) {
                try {
                    // First set from session storage for instant UI
                    const storedUser = sessionStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }

                    // Then fetch fresh data from server
                    const response = await getMe();
                    if (response.data.success) {
                        const freshUser = response.data.data.user;
                        setUser(freshUser);
                        sessionStorage.setItem('user', JSON.stringify(freshUser));
                    }
                } catch (error) {
                    console.error("Session fetch failed", error);
                    // If 401, clear session
                    if (error.response?.status === 401) {
                        sessionStorage.removeItem('token');
                        sessionStorage.removeItem('user');
                        setUser(null);
                    }
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const response = await loginAPI(email, password);
        const { token, user } = response.data.data;
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return response;
    };

    const register = async (userData) => {
        const response = await registerAPI(userData);
        const { token, user } = response.data.data;
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return response;
    };

    const updateUser = (userData) => {
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
