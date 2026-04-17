import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authAPI } from "@/lib/api.js";
import { setGlobalAuthContext } from "@/lib/auth-service.js";

interface AuthState {
  user: { id: string; email: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  setUser: (user: { id: string; email: string } | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: () => {},
  setAuthenticated: () => {},
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadUserFromToken = async () => {
    console.log('🔄 AuthProvider: loadUserFromToken started');
    try {
      const token = localStorage.getItem('kisan_auth_token');
      console.log('🔑 AuthProvider: Token exists?', !!token);
      if (token) {
        try {
          console.log('📡 AuthProvider: Calling getCurrentUser API');
          const user = await authAPI.getCurrentUser();
          console.log('✅ AuthProvider: User loaded:', user);
          setState({
            user: { id: user.id, email: user.email },
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('❌ AuthProvider: getCurrentUser failed:', error);
          localStorage.removeItem('kisan_auth_token');
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        console.log('🚫 AuthProvider: No token, setting default state');
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  useEffect(() => {
    console.log('🔍 AuthProvider: Loading user from token');
    loadUserFromToken();
  }, []);

  const setUser = (user: { id: string; email: string } | null) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: user !== null,
      isLoading: false,
    }));
  };

  const setAuthenticated = (authenticated: boolean) => {
    setState(prev => ({
      ...prev,
      isAuthenticated: authenticated,
      user: authenticated ? prev.user : null,
      isLoading: false,
    }));
  };

  const contextValue: AuthContextType = {
    ...state,
    setUser,
    setAuthenticated,
    refreshAuth: loadUserFromToken,
  };

  // Update global auth context for async functions
  useEffect(() => {
    setGlobalAuthContext(contextValue);
  }, [contextValue]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
