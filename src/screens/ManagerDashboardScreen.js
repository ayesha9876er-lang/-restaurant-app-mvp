import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';

import { request } from '../api/client';
import { updateMenuItem, withId } from '../api/menu';

export default function ManagerDashboardScreen() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [menuError, setMenuError] = useState('');
  const [menuMessage, setMenuMessage] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const result = await request('/orders');
      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.orders)
          ? result.orders
          : Array.isArray(result?.data)
            ? result.data
            : [];

      setOrders(list);
      setError('');
    } catch (err) {
      setError(err.message || 'Orders could not be loaded.');
    }
  }, []);

  const fetchMenu = useCallback(async () => {
    try {
      const result = await request('/menu');
      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.items)
          ? result.items
          : Array.isArray(result?.data)
            ? result.data
            : [];

      setMenuItems(list.map(withId));
      setMenuError('');
    } catch (err) {
      setMenuError(err.message || 'Menu could not be loaded.');
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    await Promise.all([fetchOrders(), fetchMenu()]);
    setLoading(false);
    setRefreshing(false);
  }, [fetchOrders, fetchMenu]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!orderId) {
      setError('Order ID is missing.');
      return;
    }

    try {
      setUpdatingId(String(orderId));
      setError('');

      await request(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });

      await fetchOrders();
    } catch (err) {
      setError(err.message || 'Order status could not be updated.');
    } finally {
      setUpdatingId(null);
    }
  };

  const startEditingPrice = (item) => {
    setEditingId(String(item.id || item._id));
    setNewPrice(String(item.price ?? ''));
    setMenuMessage('');
    setMenuError('');
  };

  const savePrice = async (item) => {
    const id = item.id || item._id;
    const price = Number(newPrice.trim());

    if (!newPrice.trim() || !Number.isFinite(price) || price < 0) {
      setMenuError('Please enter a valid price (zero or greater).');
      return;
    }

    try {
      setSavingPrice(true);
      setMenuError('');
      setMenuMessage('');

      const updated = await updateMenuItem(id, { price });

      setMenuItems((current) =>
        current.map((menuItem) =>
          String(menuItem.id || menuItem._id) === String(id)
            ? { ...menuItem, ...updated, price }
            : menuItem
        )
      );

      setEditingId(null);
      setNewPrice('');
      setMenuMessage(`${item.name} price updated successfully.`);
    } catch (err) {
      setMenuError(err.message || 'Price could not be updated.');
    } finally {
      setSavingPrice(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d9534f" />
        <Text style={styles.message}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshDashboard}
        />
      }
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Manager Dashboard</Text>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={refreshDashboard}
        disabled={refreshing}
      >
        <Text style={styles.btnText}>
          {refreshing ? 'Refreshing...' : 'Refresh Dashboard'}
        </Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>Menu Management</Text>
      <Text style={styles.helper}>
        Edit an item price and save it to the server.
      </Text>

      {menuError ? <Text style={styles.error}>{menuError}</Text> : null}
      {menuMessage ? (
        <Text style={styles.success}>{menuMessage}</Text>
      ) : null}

      {menuItems.length === 0 ? (
        <Text style={styles.message}>No menu items found.</Text>
      ) : (
        menuItems.map((item, index) => {
          const id = String(item.id || item._id || index);
          const isEditing = editingId === id;

          return (
            <View key={id} style={styles.card}>
              <Text style={styles.itemName}>
                {item.name || 'Unnamed item'}
              </Text>

              <Text style={styles.text}>
                Category: {item.category || 'N/A'}
              </Text>

              <Text style={styles.text}>
                Current price: Rs. {item.price ?? 0}
              </Text>

              {isEditing ? (
                <>
                  <TextInput
                    style={styles.priceInput}
                    value={newPrice}
                    onChangeText={setNewPrice}
                    placeholder="Enter new price"
                    keyboardType="decimal-pad"
                  />

                  <View style={styles.row}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.saveButton]}
                      onPress={() => savePrice(item)}
                      disabled={savingPrice}
                    >
                      <Text style={styles.btnText}>
                        {savingPrice ? 'Saving...' : 'Save Price'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.cancelButton]}
                      onPress={() => {
                        setEditingId(null);
                        setNewPrice('');
                        setMenuError('');
                      }}
                      disabled={savingPrice}
                    >
                      <Text style={styles.btnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => startEditingPrice(item)}
                >
                  <Text style={styles.btnText}>Edit Price</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}

      <Text style={styles.sectionTitle}>Orders</Text>

      {orders.length === 0 ? (
        <Text style={styles.message}>No orders found.</Text>
      ) : (
        orders.map((item, index) => {
          const orderId = item._id || item.id;
          const busy = updatingId === String(orderId);

          return (
            <View
              key={String(orderId || index)}
              style={styles.card}
            >
              <Text style={styles.text}>
                Order ID: {orderId || 'N/A'}
              </Text>

              <Text style={styles.text}>
                Status:{' '}
                <Text style={styles.status}>
                  {item.status || 'Pending'}
                </Text>
              </Text>

              <Text style={styles.text}>
                Total: Rs. {item.total ?? item.totalAmount ?? 0}
              </Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    busy && styles.disabledButton,
                  ]}
                  disabled={updatingId !== null}
                  onPress={() => updateOrderStatus(orderId, 'Preparing')}
                >
                  <Text style={styles.btnText}>
                    {busy ? 'Updating...' : 'Preparing'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.readyButton,
                    busy && styles.disabledButton,
                  ]}
                  disabled={updatingId !== null}
                  onPress={() => updateOrderStatus(orderId, 'Ready')}
                >
                  <Text style={styles.btnText}>Ready</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#222',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 18,
    marginBottom: 6,
  },
  helper: {
    color: '#555',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
    color: '#555',
  },
  error: {
    color: '#d9534f',
    marginBottom: 10,
  },
  success: {
    color: '#218838',
    marginBottom: 10,
    fontWeight: '600',
  },
  card: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemName: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#222',
  },
  text: {
    fontSize: 14,
    marginBottom: 5,
    color: '#222',
  },
  status: {
    fontWeight: 'bold',
    color: '#d9534f',
  },
  row: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#0275d8',
    padding: 11,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#218838',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  readyButton: {
    backgroundColor: '#5cb85c',
  },
  disabledButton: {
    opacity: 0.5,
  },
  refreshButton: {
    backgroundColor: '#d9534f',
    padding: 11,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    color: '#222',
  },
});
