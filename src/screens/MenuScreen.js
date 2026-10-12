import React, { useState, useMemo, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

import { CATEGORIES, withId } from '../api/menu';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../hooks/useTheme';
import { CartContext } from '../context/CartContext';
import MenuItemCard from '../components/MenuItemCard';

export default function MenuScreen({ onSearchPress }) {
  const { theme } = useTheme();
  const { addItem } = useContext(CartContext);

  // The menu now comes from the server (GET /api/menu) instead of a fake Promise.
  const { data, loading, error, refetch } = useApi('/menu');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const items = useMemo(() => (data || []).map(withId), [data]);

  const filteredItems =
    selectedCategory === 'All' ? items : items.filter((item) => item.category === selectedCategory);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // First load: nothing to show yet, so show the spinner.
  if (loading && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading menu...</Text>
      </View>
    );
  }

  // The first load failed: show the message and a Retry button.
  if (error && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background, padding: 24 }]}>
        <Text style={{ color: theme.text, marginBottom: 12, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Our Menu</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={[styles.headerCount, { color: theme.secondaryText }]}>{filteredItems.length} items</Text>
          <TouchableOpacity onPress={onSearchPress}>
            <Text style={{ color: theme.primary, fontWeight: 'bold' }}>🔍 Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* A refresh failed, but we still have the old menu to show. */}
      {error ? <Text style={styles.banner}>Could not refresh: {error}</Text> : null}

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
        data={['All', ...CATEGORIES]}
        keyExtractor={(cat) => cat}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            style={[styles.categoryChip, { backgroundColor: selectedCategory === cat ? theme.primary : theme.cardBackground }]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={{ color: selectedCategory === cat ? '#FFF' : theme.text, fontWeight: '600' }}>{cat}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MenuItemCard item={item} theme={theme} onAddToCart={addItem} />}
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 30 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <Text style={{ color: theme.text, textAlign: 'center', marginTop: 40 }}>No items in this category.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  headerCount: { fontSize: 13 },
  banner: { color: '#E63946', fontSize: 12, paddingHorizontal: 16, marginBottom: 4 },
  categoryList: { flexGrow: 0, paddingHorizontal: 12, marginBottom: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginHorizontal: 4 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#FFF', fontWeight: 'bold' },
});
