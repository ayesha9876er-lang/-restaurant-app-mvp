import React, { useContext } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
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


function MainApp() {
  const { user } = useContext(AuthContext);
  const { theme, isDarkMode } = useContext(ThemeContext);

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
      ) : (
        <View
          style={[
            styles.centered,
            {
              backgroundColor: theme.background,
            },
          ]}
        >
          <Text
            style={[
              styles.welcomeText,
              {
                color: theme.text,
              },
            ]}
          >
            Welcome!
          </Text>

          <Text style={{ color: theme.text }}>
            {user.name}
          </Text>

          <Text style={{ color: theme.text }}>
            Role: {user.role.toUpperCase()}
          </Text>
        </View>
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

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
