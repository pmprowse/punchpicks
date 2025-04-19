import React, { useState } from "react";

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error state
    setError(null);

    // Validate inputs
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // This is a mock authentication - replace with your actual auth logic
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

      // Mock validation - replace with actual auth logic
      if (username === "demo" && password === "password") {
        // Store auth token or user info in localStorage if remember me is checked
        if (rememberMe) {
          localStorage.setItem("authToken", "mock-jwt-token");
        } else {
          sessionStorage.setItem("authToken", "mock-jwt-token");
        }

        // Call the success callback
        onLoginSuccess();
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-200"
      >
        {/* Form title */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Username field */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
            placeholder="Enter your username"
            disabled={isLoading}
          />
        </div>

        {/* Password field */}
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>

        {/* Remember me checkbox */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2 leading-tight"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-700">Remember me</span>
          </label>
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>

      {/* Additional help text */}
      <p className="text-center text-sm text-gray-600">
        Contact admin if you need an account
      </p>
    </div>
  );
};

export default Login;
