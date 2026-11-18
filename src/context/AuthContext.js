
import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { request, setAuthToken, setOnUnauthorized } from '../api/client';

export const AuthContext = createContext();

const STORAGE_KEY = 'auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Save a real server session.
  const saveSession = async (data) => {
    if (!data || typeof data.token !== 'string' || data.token.split('.').length !== 3) {
      throw new Error('Server returned an invalid login token.');
    }

    const { token: newToken, ...userData } = data;

    setAuthToken(newToken);
    setToken(newToken);
    setUser(userData);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: newToken, user: userData })
    );
  };

  // Clear the current session.
  const logout = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  // Restore the saved session when the app opens.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved) {
          const parsed = JSON.parse(saved);

          if (
            typeof parsed.token === 'string' &&
            parsed.token.split('.').length === 3
          ) {
            setAuthToken(parsed.token);
            setToken(parsed.token);
            setUser(parsed.user);
          } else {
            await AsyncStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.log('Session restore failed:', error.message);
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Automatically logout if the server rejects the token.
  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  // Login through the backend only.
  const login = async (email, password) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      const data = await request('/auth/login', {
        method: 'POST',
        body: {
          email: cleanEmail,
          password: cleanPassword,
        },
      });

      await saveSession(data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed.',
      };
    }
  };

  // Register through the backend only.
  const signup = async (fullName, email, password) => {
    try {
      const data = await request('/auth/register', {
        method: 'POST',
        body: {
          name: fullName,
          email: email.trim().toLowerCase(),
          password,
        },
      });

      await saveSession(data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Signup failed.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
