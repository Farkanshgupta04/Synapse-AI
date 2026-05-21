import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
export const AuthContext = createContext();

// Standardized storage keys
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
};

const LEGACY_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

const migrateLegacyAuthState = () => {
  const legacyToken = localStorage.getItem(LEGACY_KEYS.TOKEN);
  const legacyUser = localStorage.getItem(LEGACY_KEYS.USER);

  if (legacyToken && !localStorage.getItem(STORAGE_KEYS.TOKEN)) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, legacyToken);
  }

  if (legacyUser && !localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, legacyUser);
  }
};

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => {
    migrateLegacyAuthState();

    // Try to get token from localStorage first, then cookies
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || Cookies.get("jwt") || null;
  });

  // Utility function to clear all auth data
  const clearAuthData = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(LEGACY_KEYS.TOKEN);
    localStorage.removeItem(LEGACY_KEYS.USER);
    Cookies.remove("jwt");
  };

  return (
    <AuthContext.Provider value={[authUser, setAuthUser, clearAuthData]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);