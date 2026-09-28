import React, { useContext, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';

import {
  AuthProvider,
  AuthContext,
} from './src/context/AuthContext';

import {
  ThemeProvider,
  ThemeContext,
} from './src/context/ThemeContext';

import { CartProvider } from './src/context/CartContext';

import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import SearchScreen from './src/screens/SearchScreen';


function MainApp() {
  const { user } = useContext(AuthContext);
  const { theme, isDarkMode } = useContext(ThemeContext);
  const [screen, setScreen] = useState('menu'); // 'menu' | 'search'

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >

      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />

      {!user ? (
        <LoginScreen />
      ) : screen === 'search' ? (
        <SearchScreen onBack={() => setScreen('menu')} />
      ) : (
        <MenuScreen onSearchPress={() => setScreen('search')} />
      )}

    </SafeAreaView>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
