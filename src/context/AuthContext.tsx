import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import * as AuthService from "../services/AuthService";
import { User } from "../data/users";

// Define the shape of our context
interface AuthContextType {
  isAuthenticated: boolean;
  user: Omit<User, "password"> | null;
  login: (
    username: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;
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
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if a token exists when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      const token = AuthService.getToken();
      if (token) {
        try {
          const isValid = await AuthService.verifyToken(token);
          if (isValid) {
            // TODO: Implement user retrieval based on token
            setIsAuthenticated(true);
          }
        } catch {
          AuthService.removeToken();
        }
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (
    username: string,
    password: string,
    rememberMe: boolean
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { user: loggedInUser, token } = await AuthService.login({
        username,
        password,
      });

      // Store token based on remember me preference
      AuthService.saveToken(token, rememberMe);

      // Set user and authentication state
      setUser(loggedInUser);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    AuthService.removeToken();
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
