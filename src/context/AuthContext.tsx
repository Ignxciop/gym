"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUserInfo, logout as logoutFn } from "@/lib/auth";

export type AuthUser = {
  name?: string;
  email?: string;
  avatarUrl?: string;
  birthDate?: string | null;
  gender?: string;
  isAdmin?: boolean;
  token?: string;
};

interface AuthContextType {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetchUserInfo()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const logout = () => {
    setUser(null);
    logoutFn();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
