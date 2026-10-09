import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';

const RootStack = createNativeStackNavigator();
const MenuStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Nested stack: the Menu tab contains its own stack (Menu list -> Search).
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

function MainTabs() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const isManager = user.role === 'manager';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.cardBackground,
          borderTopColor: theme.border,
        },
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
        <Tab.Screen
          name="Menu"
          component={MenuStackNavigator}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>🍽️</Text> }}
        />
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
  const { user } = useAuth();
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