// src/utils/auth.js

const TOKEN_KEY = 'authToken'; // Define a constant key for consistency

/**
 * Stores the authentication token in localStorage.
 * @param {string} token - The authentication token.
 */
export const setAuthToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    console.log('Token stored in localStorage.');
  } catch (error) {
    console.error('Error storing token in localStorage:', error);
    // Handle cases where localStorage might be full or inaccessible (e.g., in incognito)
  }
};

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string | null} The token if found, otherwise null.
 */
export const getAuthToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    // console.log('Token retrieved from localStorage:', token ? 'Found' : 'Not Found');
    return token;
  } catch (error) {
    console.error('Error retrieving token from localStorage:', error);
    return null;
  }
};

/**
 * Removes the authentication token from localStorage.
 */
export const removeAuthToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    console.log('Token removed from localStorage.');
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
};

/**
 * Clears all authentication-related data (e.g., during logout)
 */
export const clearAuthData = () => {
  removeAuthToken();
  // If you have other auth-related items in localStorage, clear them here
  // localStorage.removeItem('userId');
};