import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // Check local storage for persistent user details
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      document.body.setAttribute('data-role', parsedUser.role);
    }
    
    // Set theme attributes on initial render
    document.body.setAttribute('data-theme', theme);
    setLoading(false);
  }, [theme]);

  const login = async (usernameOrEmail, password, role, rememberMe) => {
    try {
      const response = await api.post('/auth/login', { usernameOrEmail, password, role });
      const { accessToken, role: userRole, username, email, fullName, userId, twoFactorRequired } = response.data;

      if (twoFactorRequired) {
        return { twoFactorRequired: true };
      }

      const userDetails = { userId, username, email, fullName, role: userRole };
      setUser(userDetails);
      
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', accessToken);
      storage.setItem('user', JSON.stringify(userDetails));
      
      document.body.setAttribute('data-role', userRole);
      return { success: true, role: userRole };
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  };

  const verify2FA = async (usernameOrEmail, code, rememberMe) => {
    try {
      const response = await api.post(`/auth/verify-2fa?usernameOrEmail=${usernameOrEmail}&code=${code}`);
      const { accessToken, role: userRole, username, email, fullName, userId } = response.data;

      const userDetails = { userId, username, email, fullName, role: userRole };
      setUser(userDetails);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', accessToken);
      storage.setItem('user', JSON.stringify(userDetails));

      document.body.setAttribute('data-role', userRole);
      return { success: true, role: userRole };
    } catch (error) {
      throw error.response?.data?.message || 'Invalid 2FA code.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    setUser(null);
    document.body.removeAttribute('data-role');
  };

  const updateUserProfile = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(merged));
      } else {
        sessionStorage.setItem('user', JSON.stringify(merged));
      }
      return merged;
    });
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.body.setAttribute('data-theme', nextTheme);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verify2FA, logout, updateUserProfile, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};
