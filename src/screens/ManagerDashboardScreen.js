import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { CATEGORIES, withId, createMenuItem, updateMenuItem } from '../api/menu';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400';

// One row of the menu list: name, a price box with a Save button, and an availability switch.
function ItemRow({ item, theme, onChange, onInvalid }) {
  const [priceText, setPriceText] = useState(String(item.price));
  const [busy, setBusy] = useState(false);

  const priceChanged = priceText.trim() !== String(item.price);

  const savePrice = async () => {
    const price = Number(priceText);
    if (!priceText.trim() || Number.isNaN(price) || price < 0) {
      onInvalid('Enter a valid price (a number, 0 or more)');
      return;
    }
    setBusy(true);
    await onChange(item.id, { price }, `Price of ${item.name} is now Rs. ${price}`);
    setBusy(false);
  };

  const toggleAvailability = async (value) => {
    setBusy(true);
    await onChange(
      item.id,
      { isAvailable: value },
      `${item.name} is now ${value ? 'available' : 'unavailable'}`
    );
    setBusy(false);
  };

  return (
    <View style={[styles.row, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={styles.rowTop}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
          <Text style={{ color: theme.secondaryText, fontSize: 12 }}>{item.category}</Text>
        </View>
        <View style={styles.switchBox}>
          <Text style={{ color: theme.secondaryText, fontSize: 12, marginRight: 6 }}>
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </Text>
          <Switch
            value={Boolean(item.isAvailable)}
            onValueChange={toggleAvailability}
            disabled={busy}
            trackColor={{ false: '#BBBBBB', true: theme.primary }}
          />
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={{ color: theme.text }}>Rs.</Text>
        <TextInput
          style={[styles.priceInput, { color: theme.text, borderColor: theme.border }]}
          value={priceText}
          onChangeText={setPriceText}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary, opacity: priceChanged && !busy ? 1 : 0.4 }]}
          onPress={savePrice}
          disabled={!priceChanged || busy}
        >
          <Text style={styles.saveText}>Save price</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ManagerDashboardScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const { data, loading, error, refetch } = useApi('/menu');
  const items = useMemo(() => (data || []).map(withId), [data]);

  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [refreshing, setRefreshing] = useState(false);

  // "Add item" form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Mains');
  const [adding, setAdding] = useState(false);

  const showError = (text) => setMessage({ type: 'error', text });
  const showSuccess = (text) => setMessage({ type: 'success', text });

  // Used by every row: call the protected endpoint, then reload the list from the server.
  const changeItem = async (id, changes, successText) => {
    try {
      await updateMenuItem(id, changes);
      await refetch();
      showSuccess(successText);
    } catch (err) {
      showError(err.message);
    }
  };

  const addItem = async () => {
    const itemName = name.trim();
    const priceNumber = Number(price);

    if (!itemName) {
      showError('Enter a name for the new item');
      return;
    }
    if (!price.trim() || Number.isNaN(priceNumber) || priceNumber < 0) {
      showError('Enter a valid price (a number, 0 or more)');
      return;
    }

    setAdding(true);
    try {
      await createMenuItem({
        name: itemName,
        description: description.trim(),
        price: priceNumber,
        category,
        image: DEFAULT_IMAGE,
        isSpecial: false,
        isAvailable: true,
      });
      setName('');
      setDescription('');
      setPrice('');
      await refetch();
      showSuccess(`${itemName} was added to the menu`);
    } catch (err) {
      showError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading menu...</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background, padding: 24 }]}>
        <Text style={{ color: theme.text, marginBottom: 12, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={refetch}>
          <Text style={styles.saveText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const header = (
    <View>
      <Text style={[styles.title, { color: theme.text }]}>Manager Dashboard</Text>
      <Text style={{ color: theme.secondaryText, marginBottom: 12 }}>Welcome, {user.name}</Text>

      {message ? (
        <Text style={[styles.message, { color: message.type === 'error' ? '#E63946' : '#2E7D32' }]}>
          {message.text}
        </Text>
      ) : null}
      {error ? <Text style={[styles.message, { color: '#E63946' }]}>Could not refresh: {error}</Text> : null}

      <View style={[styles.form, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Add a menu item</Text>

        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="Name"
          placeholderTextColor={theme.placeholder}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="Description (optional)"
          placeholderTextColor={theme.placeholder}
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="Price"
          placeholderTextColor={theme.placeholder}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <View style={styles.chips}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, { backgroundColor: category === cat ? theme.primary : 'transparent', borderColor: theme.primary }]}
              onPress={() => setCategory(cat)}
            >
              <Text style={{ color: category === cat ? '#FFF' : theme.text, fontSize: 12 }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary, opacity: adding ? 0.6 : 1 }]}
          onPress={addItem}
          disabled={adding}
        >
          {adding ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Add item</Text>}
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>
        Menu management ({items.length} items)
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <ItemRow item={item} theme={theme} onChange={changeItem} onInvalid={showError} />
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  message: { fontSize: 13, marginBottom: 10, fontWeight: '600' },
  form: { borderWidth: 1, borderRadius: 12, padding: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8, fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5 },
  addButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  row: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: 'bold' },
  switchBox: { flexDirection: 'row', alignItems: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  priceInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, minWidth: 90, fontSize: 15 },
  saveButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  saveText: { color: '#FFF', fontWeight: 'bold' },
});
