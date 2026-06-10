import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

function decodeRole(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("femwellconnect_token");
  });

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("femwellconnect_token", newToken);
    } else {
      localStorage.removeItem("femwellconnect_token");
    }
    setTokenState(newToken);
  };

  const logout = () => {
    setToken(null);
    queryClient.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL;
    if (apiBase) {
      setBaseUrl(apiBase);
    }
    setAuthTokenGetter(() => {
      const currentToken = localStorage.getItem("femwellconnect_token");
      return currentToken;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        isAuthenticated: !!token,
        isAdmin: token ? decodeRole(token) === "admin" : false,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
