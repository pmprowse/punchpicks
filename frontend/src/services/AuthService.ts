// src/services/AuthService.ts
interface LoginRequest {
  username: string;
  password: string;
}

interface User {
  username: string;
  id: number;
  role?: string;
}

export interface LoginResponse {
  user: User;
}

// Base URL for API requests
const API_URL = "http://localhost:8000/api";

// Login function - sends credentials to the backend
export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Include credentials to allow cookies to be sent and received
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Login failed");
    }

    const data = await response.json();
    return { user: data };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred during login");
  }
};

// Check if user is currently authenticated
export const checkAuth = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      credentials: "include", // Include cookies
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
};

// Logout function - clears the session cookie
export const logout = async (): Promise<void> => {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include", // Include cookies
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
};
