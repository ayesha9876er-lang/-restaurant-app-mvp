import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>My Profile</Text>

      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.secondaryText }]}>Name</Text>
          <Text style={[styles.value, { color: theme.text }]}>{user.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.secondaryText }]}>Email</Text>
          <Text style={[styles.value, { color: theme.text }]}>{user.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.secondaryText }]}>Role</Text>
          <Text style={[styles.value, { color: theme.text }]}>{user.role.toUpperCase()}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.switchRow}>
          <Text style={[styles.value, { color: theme.text }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#BBBBBB', true: theme.primary }}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.primary }]}
        onPress={logout}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 14 },
  value: { fontSize: 16, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoutButton: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  logoutText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});