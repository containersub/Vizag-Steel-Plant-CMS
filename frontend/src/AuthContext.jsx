// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the AuthContext
const AuthContext = createContext(null);

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  // State to hold the user data and token
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // Get token from local storage
  const navigate = useNavigate();

  // Effect to load user data from local storage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Function to handle user login
  const login = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData)); // Store user data in local storage
    localStorage.setItem('token', authToken); // Store token in local storage
  };

  // Function to handle user logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user'); // Clear user data from local storage
    localStorage.removeItem('token'); // Clear token from local storage
    navigate('/login'); // Redirect to login page after logout
  };

  // Value provided by the context
  const authContextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user, // Convenience flag to check if user is logged in
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
