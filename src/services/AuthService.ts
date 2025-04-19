// src/services/authService.ts

/**
 * Authentication service for handling API requests related to user authentication
 */

// Types for authentication requests and responses
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

/**
 * Attempts to authenticate a user with the provided credentials
 */
export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  // For now, this is a mock implementation
  // In a real application, this would be an API call

  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      // Mock validation
      if (
        credentials.username === "demo" &&
        credentials.password === "password"
      ) {
        resolve({
          token: "mock-jwt-token",
          user: {
            id: "1",
            username: "demo",
          },
        });
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 1000);
  });
};

/**
 * Verifies if the current token is valid
 */
export const verifyToken = async (token: string): Promise<boolean> => {
  // Mock implementation
  // In a real application, this would validate the token with your backend

  return new Promise((resolve) => {
    setTimeout(() => {
      // For the mock, we'll just check if the token matches our expected value
      resolve(token === "mock-jwt-token");
    }, 500);
  });
};

/**
 * Logs the user out
 */
export const logout = async (): Promise<void> => {
  // Mock implementation
  // In a real application, this might involve invalidating the token on the server

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 300);
  });
};

/**
 * Gets the stored auth token from storage
 */
export const getToken = (): string | null => {
  return (
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  );
};

/**
 * Stores the auth token in the appropriate storage based on remember me preference
 */
export const saveToken = (token: string, rememberMe: boolean): void => {
  if (rememberMe) {
    localStorage.setItem("authToken", token);
  } else {
    sessionStorage.setItem("authToken", token);
  }
};

/**
 * Removes the auth token from all storages
 */
export const removeToken = (): void => {
  localStorage.removeItem("authToken");
  sessionStorage.removeItem("authToken");
};
