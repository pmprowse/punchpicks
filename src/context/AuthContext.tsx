import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

// Define the shape of our context
interface AuthContextType {
  isAuthenticated: boolean;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if a token exists when the app loads
  useEffect(() => {
    const checkAuth = () => {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (token) {
        // Here you would typically validate the token with your backend
        // For now, we'll just set isAuthenticated to true if a token exists
        setIsAuthenticated(true);
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
      // TODO: Replace with actual API call
      // This is a mock authentication - replace with your actual auth logic
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

      // Mock validation - replace with actual auth logic
      if (username === "demo" && password === "password") {
        const token = "mock-jwt-token";

        // Store token based on remember me preference
        if (rememberMe) {
          localStorage.setItem("authToken", token);
        } else {
          sessionStorage.setItem("authToken", token);
        }

        setIsAuthenticated(true);
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

  // Provide the context value
  const value = {
    isAuthenticated,
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
