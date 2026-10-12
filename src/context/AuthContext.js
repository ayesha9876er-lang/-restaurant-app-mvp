import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { request, setAuthToken, setOnUnauthorized } from '../api/client';

export const AuthContext = createContext();

const STORAGE_KEY = 'auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // true while we check AsyncStorage at app start, so the login screen does not flash.
  const [isLoading, setIsLoading] = useState(true);

  // Keep the session in memory, in the API client, and on the phone.
  const saveSession = async (data) => {
    const { token: newToken, ...userData } = data;
    setAuthToken(newToken);
    setToken(newToken);
    setUser(userData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: newToken, user: userData }));
  };

  const logout = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  // On app start: restore a saved login, if there is one.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setAuthToken(parsed.token);
          setToken(parsed.token);
          setUser(parsed.user);
        }
      } catch (error) {
        await AsyncStorage.removeItem(STORAGE_KEY); // saved data was damaged
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  // If the server rejects our token (for example it expired), log out automatically.
  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  const login = async (email, password) => {
    try {
      const data = await request('/auth/login', { method: 'POST', body: { email, password } });
      await saveSession(data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const signup = async (fullName, email, password) => {
    try {
      const data = await request('/auth/register', {
        method: 'POST',
        body: { name: fullName, email, password },
      });
      await saveSession(data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
