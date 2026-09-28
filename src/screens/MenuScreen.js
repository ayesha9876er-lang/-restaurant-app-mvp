import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

import { MENU_ITEMS, CATEGORIES } from '../data/menu';
import { ThemeContext } from '../context/ThemeContext';
import { CartContext } from '../context/CartContext';
import MenuItemCard from '../components/MenuItemCard';

export default function MenuScreen() {
  const { theme } = useContext(ThemeContext);
  const { addItem } = useContext(CartContext);

  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadMenu = () => {
    setIsLoading(true);
    setHasError(false);

    const timer = setTimeout(() => {
      const didFail = false; // set true manually to test the error state
      if (didFail) {
        setHasError(true);
      } else {
        setItems(MENU_ITEMS);
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    const cleanup = loadMenu();
    return cleanup;
  }, []); // empty dependency array — runs exactly once, when the screen first mounts

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setItems(MENU_ITEMS);
      setRefreshing(false);
    }, 800);
  };

  const filteredItems =
    selectedCategory === 'All' ? items : items.filter((item) => item.category === selectedCategory);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading menu...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, marginBottom: 12 }}>Something went wrong while loading the menu.</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={loadMenu}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Our Menu</Text>
        <Text style={[styles.headerCount, { color: theme.secondaryText }]}>{filteredItems.length} items</Text>
      </View>

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
  categoryList: { flexGrow: 0, paddingHorizontal: 12, marginBottom: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginHorizontal: 4 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#FFF', fontWeight: 'bold' },
});