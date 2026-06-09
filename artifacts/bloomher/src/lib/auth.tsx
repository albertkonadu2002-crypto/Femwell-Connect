import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
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
