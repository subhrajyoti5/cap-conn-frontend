"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoaded(true);
        return;
      }
      try {
        const res = await apiFetch("/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res?.data) {
          setUser(res.data);
          setIsSignedIn(true);
        }
      } catch {
        localStorage.removeItem("token");
      } finally {
        setIsLoaded(true);
      }
    }
    loadUser();
  }, []);

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsSignedIn(false);
    window.location.href = "/";
  };

  const getToken = async () => {
    return localStorage.getItem("token");
  };

  const login = async (email, password) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    setUser(user);
    setIsSignedIn(true);
    return user;
  };

  const signup = async (name, email, password) => {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    setUser(user);
    setIsSignedIn(true);
    return user;
  };

  const value = {
    user,
    isLoaded,
    isSignedIn,
    signOut,
    getToken,
    userId: user?.id || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useUser() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useUser must be used within AuthProvider");
  return { user: ctx.user, isLoaded: ctx.isLoaded };
}
