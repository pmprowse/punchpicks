// src/pages/HomePage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Login from "../components/Login/Login";
import { useAuth } from "../context/AuthContext";

const HomePage: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div
        className="text-center p-8 transition-all duration-500 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isAuthenticated ? (
          <>
            <Link to="/fights">
              <h1
                className={`text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight transition-all duration-500 ${
                  isHovered ? "text-indigo-600 scale-105" : "text-gray-900"
                } cursor-pointer`}
              >
                Punch Picks
              </h1>
            </Link>
            <p
              className={`mt-4 text-xl transition-all duration-500 ${
                isHovered ? "text-indigo-500" : "text-gray-600"
              }`}
            >
              Click the title to make your fight predictions
            </p>
            <button
              onClick={logout}
              className="mt-6 text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <h1
              className={`text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight transition-all duration-500 ${
                isHovered ? "text-indigo-600 scale-105" : "text-gray-900"
              }`}
            >
              Punch Picks
            </h1>
            <p
              className={`mt-4 text-xl transition-all duration-500 mb-8 ${
                isHovered ? "text-indigo-500" : "text-gray-600"
              }`}
            >
              Login below to make your picks
            </p>
            <div className="mt-8 max-w-md mx-auto">
              <Login />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
