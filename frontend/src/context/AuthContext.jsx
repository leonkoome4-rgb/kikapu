import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchMe, loginUser, registerUser } from "../api/auth";
import { setTokens, clearTokens } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!localStorage.getItem("kikapu_access_token")) {
      setLoading(false);
      return;
    }
    try {
      const { user } = await fetchMe();
      setUser(user);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const onLogout = () => setUser(null);
    window.addEventListener("kikapu:logout", onLogout);
    return () => window.removeEventListener("kikapu:logout", onLogout);
  }, [loadUser]);

  const login = async (identifier, password) => {
    const data = await loginUser({ email: identifier, password });
    setTokens(data);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await registerUser(payload);
    setTokens(data);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
