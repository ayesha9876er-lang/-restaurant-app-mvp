import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used inside an <AuthProvider>. Wrap your app with <AuthProvider> in App.js.'
    );
  }

  return context;
}