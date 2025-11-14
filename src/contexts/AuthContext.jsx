import React from 'react';
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import authService from "../services/authService.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the app starts, check if user is logged in
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const { user } = await authService.loginUser(email, password);
    setUser(user);
    return user;
  };

  const register = async (credentials) => {
    const { user } = await authService.registerUser(credentials);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logoutUser();
    setUser(null);
  };

  const refreshUser = async () => {
    if (!authService.getToken()) {
      setUser(null);
      return null;
    }
    try {
      const current = await authService.getCurrentUser();
      setUser(current);
      return current;
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    const updated = await authService.updateUserProfile(updates);
    setUser(updated);
    return updated;
  };

  const changePassword = (currentPassword, newPassword) =>
    authService.changeUserPassword(currentPassword, newPassword);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
      changePassword,
    }),
    [user, loading]
  );
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
