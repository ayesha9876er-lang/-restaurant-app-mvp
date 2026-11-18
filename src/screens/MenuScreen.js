
import React, { useState, useMemo, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { CATEGORIES, withId } from '../api/menu';
import { useTheme } from '../hooks/useTheme';
import { CartContext } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import MenuItemCard from '../components/MenuItemCard';

export default function MenuScreen({ onSearchPress }) {
  const { theme } = useTheme();
  const { addItem } = useContext(CartContext);

  const {
    menuItems,
    loading,
    error,
    reloadMenu,
  } = useMenu();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // Convert MongoDB _id into id
  const items = useMemo(
    () => menuItems.map(withId),
    [menuItems]
  );

  // Filter menu items by category
  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter(
          (item) => item.category === selectedCategory
        );

  // Reload menu from backend API
  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await reloadMenu();
    } catch (err) {
      console.log('Menu refresh error:', err.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            { color: theme.text },
          ]}
        >
          Our Menu
        </Text>

        <View style={styles.headerActions}>
          <Text
            style={[
              styles.headerCount,
              { color: theme.secondaryText },
            ]}
          >
            {filteredItems.length} items
          </Text>

          <TouchableOpacity onPress={onSearchPress}>
            <Text
              style={{
                color: theme.primary,
                fontWeight: 'bold',
              }}
            >
              🔍 Search
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading Message */}
      {loading && (
        <Text
          style={[
            styles.message,
            { color: theme.text },
          ]}
        >
          Loading menu...
        </Text>
      )}

      {/* API Error Message */}
      {error && (
        <Text style={styles.errorMessage}>
          Menu Error: {error}
        </Text>
      )}

      {/* Categories */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
        data={['All', ...CATEGORIES]}
        keyExtractor={(cat) => cat}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === cat
                    ? theme.primary
                    : theme.cardBackground,
              },
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={{
                color:
                  selectedCategory === cat
                    ? '#FFFFFF'
                    : theme.text,
                fontWeight: '600',
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Menu Items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            theme={theme}
            onAddToCart={addItem}
          />
        )}
        contentContainerStyle={{
          paddingVertical: 10,
          paddingBottom: 30,
          flexGrow: 1,
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          !loading && !error ? (
            <Text
              style={[
                styles.message,
                { color: theme.secondaryText },
              ]}
            >
              No menu items available.
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  headerCount: {
    fontSize: 13,
  },

  categoryList: {
    flexGrow: 0,
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },

  message: {
    textAlign: 'center',
    padding: 15,
    fontSize: 15,
  },

  errorMessage: {
    color: 'red',
    padding: 12,
    fontSize: 14,
  },
});
