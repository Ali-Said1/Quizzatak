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
      } catch (error) {
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
  const value = useMemo(() => ({
  user, loading, isAuthenticated: !!user, login, register, logout
    }), [user, loading]);
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);
