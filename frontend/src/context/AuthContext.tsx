// src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import * as AuthService from "../services/AuthService";

// Define the shape of our context
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  error: null,
});

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated when the app loads
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const user = await AuthService.checkAuth();
        if (user) {
          setUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };

    checkAuthentication();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { user } = await AuthService.login({
        username,
        password,
      });

      // Set user and authentication state
      setUser(user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    await AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Provide the context value
  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
