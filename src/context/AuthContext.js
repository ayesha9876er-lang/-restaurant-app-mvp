import React, { createContext, useState } from 'react';
import { USERS } from '../data/users';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(USERS);

  const login = (email, password) => {
    const foundUser = users.find(
      (u) =>
        u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
        u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const signup = (fullName, email, password, role) => {
    const emailExists = users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (emailExists) {
      return { success: false, message: 'An account with this email already exists' };
    }

    const newUser = {
      id: String(users.length + 1),
      name: fullName,
      email: email.trim(),
      password,
      role,
    };

    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};