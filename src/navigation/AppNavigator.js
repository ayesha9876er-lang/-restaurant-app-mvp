import React, { useContext } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { CartContext } from '../context/CartContext';

import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import SearchScreen from '../screens/SearchScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';

const RootStack = createNativeStackNavigator();
const MenuStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MenuStackNavigator() {
  return (
    <MenuStack.Navigator screenOptions={{ headerShown: false }}>
      <MenuStack.Screen name="MenuHome">
        {({ navigation }) => (
          <MenuScreen onSearchPress={() => navigation.navigate('Search')} />
        )}
      </MenuStack.Screen>
      <MenuStack.Screen name="Search">
        {({ navigation }) => <SearchScreen onBack={() => navigation.goBack()} />}
      </MenuStack.Screen>
    </MenuStack.Navigator>
  );
}

// Small red circle shown on the Cart tab icon with the current item count.
function CartIcon() {
  const { itemCount } = useContext(CartContext);
  return (
    <View>
      <Text style={{ fontSize: 18 }}>🛒</Text>
      {itemCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -8,
            backgroundColor: '#E63946',
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 3,
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{itemCount}</Text>
        </View>
      )}
    </View>
  );
}

function MainTabs() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const isManager = user.role === 'manager';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.cardBackground, borderTopColor: theme.border },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondaryText,
      }}
    >
      {isManager && (
        <Tab.Screen
          name="Dashboard"
          component={ManagerDashboardScreen}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>📋</Text> }}
        />
      )}

      {!isManager && (
        <>
          <Tab.Screen
            name="Menu"
            component={MenuStackNavigator}
            options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>🍽️</Text> }}
          />
          <Tab.Screen
            name="Cart"
            component={CartScreen}
            options={{ tabBarIcon: () => <CartIcon /> }}
          />
        </>
      )}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();
  const { theme, isDark } = useTheme();

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: theme.background,
      card: theme.cardBackground,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  // While the app checks whether a login was saved, show a spinner (not the login screen).
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
