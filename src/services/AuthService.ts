import { users, User } from "../data/users";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, "password">;
  token: string;
}

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      // Find user that matches credentials
      const user = users.find(
        (u) =>
          u.username === credentials.username &&
          u.password === credentials.password
      );

      if (user) {
        // Destructure to remove password
        const { password, ...userWithoutPassword } = user;

        resolve({
          user: userWithoutPassword,
          token: `mock-token-${user.username}`,
        });
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 300);
  });
};

export const verifyToken = async (token: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if token matches any user
      const isValid = users.some(
        (user) => token === `mock-token-${user.username}`
      );
      resolve(isValid);
    }, 100);
  });
};

export const logout = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, 100);
  });
};

export const getToken = (): string | null => {
  return (
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  );
};

export const saveToken = (token: string, rememberMe: boolean): void => {
  if (rememberMe) {
    localStorage.setItem("authToken", token);
  } else {
    sessionStorage.setItem("authToken", token);
  }
};

export const removeToken = (): void => {
  localStorage.removeItem("authToken");
  sessionStorage.removeItem("authToken");
};
