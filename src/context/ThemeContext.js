import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

// Both colour palettes live here, in one file.
export const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  secondaryText: '#666666',
  cardBackground: '#F5F5F5',
  primary: '#E63946',
  border: '#DDDDDD',
  placeholder: '#999999',
};

export const darkTheme = {
  background: '#121212',
  text: '#FFFFFF',
  secondaryText: '#AAAAAA',
  cardBackground: '#1E1E1E',
  primary: '#E63946',
  border: '#333333',
  placeholder: '#777777',
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};