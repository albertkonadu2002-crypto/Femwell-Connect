import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("bloomher_token");
  });

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("bloomher_token", newToken);
    } else {
      localStorage.removeItem("bloomher_token");
    }
    setTokenState(newToken);
  };

  const logout = () => {
    setToken(null);
    window.location.href = "/";
  };

  useEffect(() => {
    setAuthTokenGetter(() => {
      const currentToken = localStorage.getItem("bloomher_token");
      return currentToken;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        isAuthenticated: !!token,
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
