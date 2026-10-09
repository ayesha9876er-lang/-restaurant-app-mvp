import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { MENU_ITEMS } from '../data/menu';
import { useTheme } from '../hooks/useTheme';
import { CartContext } from '../context/CartContext';
import MenuItemCard from '../components/MenuItemCard';

export default function SearchScreen({ onBack }) {
  const { theme } = useTheme();
  const { addItem } = useContext(CartContext);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Refs do NOT cause a re-render when changed, unlike state.
  const searchInputRef = useRef(null);
  const flatListRef = useRef(null);
  const debounceTimer = useRef(null);
  const renderCount = useRef(0);

  renderCount.current += 1; // just counting, not triggering any re-render

  useEffect(() => {
    // Cleanup: clear any pending debounce timer if the screen unmounts.
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const runSearch = (text) => {
    if (!text.trim()) {
      setResults([]);
      return;
    }
    const filtered = MENU_ITEMS.filter((item) =>
      item.name.toLowerCase().includes(text.trim().toLowerCase())
    );
    setResults(filtered);
  };

  const handleChangeText = (text) => {
    setQuery(text);

    // Manual debounce using useRef: no external library, no useState for the timer.
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      runSearch(text);
    }, 400);
  };

  const handleSubmitSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const withoutDuplicate = prev.filter(
        (s) => s.toLowerCase() !== trimmed.toLowerCase()
      );
      const updated = [trimmed, ...withoutDuplicate];
      return updated.slice(0, 5); // keep only the last 5
    });
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    // Clear text but keep keyboard focus on the input.
    searchInputRef.current?.focus();
  };

  const focusSearchInput = () => {
    searchInputRef.current?.focus();
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowBackToTop(offsetY > 300);
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.primary, fontWeight: 'bold' }}>← Back to Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.searchBar, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}
        onPress={focusSearchInput}
        activeOpacity={1}
      >
        <TextInput
          ref={searchInputRef}
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search menu items..."
          placeholderTextColor={theme.placeholder}
          value={query}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmitSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Clear</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {recentSearches.length > 0 && query.length === 0 && (
        <View style={styles.recentContainer}>
          <Text style={[styles.recentTitle, { color: theme.secondaryText }]}>Recent Searches</Text>
          <View style={styles.recentChips}>
            {recentSearches.map((s, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.recentChip, { backgroundColor: theme.cardBackground }]}
                onPress={() => {
                  setQuery(s);
                  runSearch(s);
                }}
              >
                <Text style={{ color: theme.text }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MenuItemCard item={item} theme={theme} onAddToCart={addItem} />
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 60 }}
        ListEmptyComponent={
          query.length > 0 ? (
            <Text style={{ color: theme.text, textAlign: 'center', marginTop: 40 }}>
              No items match "{query}".
            </Text>
          ) : null
        }
      />

      {showBackToTop && (
        <TouchableOpacity
          style={[styles.backToTop, { backgroundColor: theme.primary }]}
          onPress={scrollToTop}
        >
          <Text style={styles.backToTopText}>Back to Top</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { paddingHorizontal: 16, paddingTop: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 10 },
  recentContainer: { paddingHorizontal: 16, marginBottom: 8 },
  recentTitle: { fontSize: 12, marginBottom: 6 },
  recentChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  backToTop: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 4,
  },
  backToTopText: { color: '#FFF', fontWeight: 'bold' },
});