import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function ManagerDashboardScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Manager Dashboard</Text>
      <Text style={{ color: theme.secondaryText, marginBottom: 20 }}>
        Welcome, {user.name}
      </Text>

      {['Incoming Orders', 'Reservations', 'Menu Management'].map((section) => (
        <View
          key={section}
          style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>{section}</Text>
          <Text style={{ color: theme.secondaryText }}>Nothing here yet.</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
});