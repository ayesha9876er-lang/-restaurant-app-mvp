import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      'useTheme must be used inside a <ThemeProvider>. Wrap your app with <ThemeProvider> in App.js.'
    );
  }

  return context;
}