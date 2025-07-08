// src/hooks/useAuth.js
import { useContext } from 'react'; // Corrected: changed '=>' to 'from'
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

// Custom hook to provide easy access to the authentication context
export const useAuth = () => {
  // useContext returns the value passed to the nearest AuthContext.Provider
  // This value contains the 'user' object, and 'login', 'register', 'logout' functions
  return useContext(AuthContext);
};