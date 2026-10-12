import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { request } from '../api/client';
import { withId } from '../api/menu';
import { useTheme } from '../hooks/useTheme';
import { CartContext } from '../context/CartContext';
import MenuItemCard from '../components/MenuItemCard';

export default function SearchScreen({ onBack }) {
  const { theme } = useTheme();
  const { addItem } = useContext(CartContext);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Refs do NOT cause a re-render when changed, unlike state.
  const searchInputRef = useRef(null);
  const flatListRef = useRef(null);
  const debounceTimer = useRef(null);
  const renderCount = useRef(0);
  const latestSearch = useRef(0); // numbers the searches so an old answer cannot replace a newer one

  renderCount.current += 1; // just counting, not triggering any re-render

  useEffect(() => {
    return () => {
      // Cleanup: stop the pending timer and ignore any answer that arrives later.
      latestSearch.current += 1;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Searching is now done by the server: GET /api/menu?search=...
  const runSearch = async (text) => {
    const searchId = ++latestSearch.current;

    if (!text.trim()) {
      setResults([]);
      setSearchError('');
      return;
    }

    try {
      const data = await request(`/menu?search=${encodeURIComponent(text.trim())}`);
      if (searchId === latestSearch.current) {
        setResults(data.map(withId));
        setSearchError('');
      }
    } catch (error) {
      if (searchId === latestSearch.current) {
        setSearchError(error.message);
      }
    }
  };

  const handleChangeText = (text) => {
    setQuery(text);

    // Manual debounce using useRef: wait 400ms after the last key press.
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
      const withoutDuplicate = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...withoutDuplicate].slice(0, 5); // keep only the last 5
    });
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearchError('');
    latestSearch.current += 1; // ignore any search still in flight
    searchInputRef.current?.focus();
  };

  const focusSearchInput = () => {
    searchInputRef.current?.focus();
  };

  const handleScroll = (event) => {
    setShowBackToTop(event.nativeEvent.contentOffset.y > 300);
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

      {searchError ? <Text style={styles.errorText}>{searchError}</Text> : null}

      <FlatList
        ref={flatListRef}
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MenuItemCard item={item} theme={theme} onAddToCart={addItem} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 60 }}
        ListEmptyComponent={
          query.length > 0 && !searchError ? (
            <Text style={{ color: theme.text, textAlign: 'center', marginTop: 40 }}>
              No items match "{query}".
            </Text>
          ) : null
        }
      />

      {showBackToTop && (
        <TouchableOpacity style={[styles.backToTop, { backgroundColor: theme.primary }]} onPress={scrollToTop}>
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
  errorText: { color: '#E63946', fontSize: 13, paddingHorizontal: 16, marginTop: 6 },
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
