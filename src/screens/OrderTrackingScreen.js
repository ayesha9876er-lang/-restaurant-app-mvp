import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { request } from '../api/client';

export default function OrderTrackingScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      // 1. Pehle Mobile me Save hue Orders dikhao - taake turant dikhe
      const saved = await AsyncStorage.getItem('my_orders');
      if (saved) {
        const localOrders = JSON.parse(saved);
        if (Array.isArray(localOrders) && localOrders.length > 0) {
          setOrders(localOrders);
          setLoading(false);
          // Error mat dikhao agar local orders hain
          setError('');
        }
      }

      // 2. Phir Server se fresh lene ki koshish
      try {
        const response = await request('/orders/my');
        const list = Array.isArray(response)
          ? response
          : response?.orders || response?.data || [];

        if (Array.isArray(list) && list.length > 0) {
          // Server wale + Mobile wale jo abhi sync nahi hue - dono dikhao
          const localOnly = saved ? JSON.parse(saved).filter(o => !o.synced) : [];
          const merged = [...localOnly, ...list];
          setOrders(merged);
          setError('');
        }
      } catch (serverError) {
        // Server band hai to koi baat nahi, Mobile wale hi kaafi hain
        console.log('Server nahi mila, local orders dikha rahe hain');
        if (!saved || JSON.parse(saved).length === 0) {
          // Agar Mobile me bhi kuch nahi to bas khali dikhao, Error nahi
          setOrders([]);
        }
        setError('');
      }
    } catch (err) {
      setError('');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const clearHistory = async () => {
    await AsyncStorage.removeItem('my_orders');
    setOrders([]);
  };

  if (loading && orders.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d9534f" />
        <Text>Orders loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Order Tracking</Text>

      {error ? (
        <View>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.btn} onPress={fetchOrders}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, index) => String(item._id || item.id || index)}
          onRefresh={fetchOrders}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No orders yet. Place an order from Cart first.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.orderId}>
                Order ID: {item._id || item.id || 'N/A'}
              </Text>
              <Text style={styles.status}>
                Status: {item.status || 'Placed'}
              </Text>
              {item.tableNumber || item.tableNo ? (
                <Text style={styles.detail}>Table: {item.tableNumber || item.tableNo}</Text>
              ) : null}
              {item.orderType || item.type ? (
                <Text style={styles.detail}>Type: {item.orderType || item.type}</Text>
              ) : null}
              {item.items && Array.isArray(item.items) ? (
                <Text style={styles.detail}>
                  Items: {item.items.map(i => `${i.name || i.title || 'Item'} x ${i.quantity || 1}`).join(', ')}
                </Text>
              ) : null}
              <Text style={styles.total}>
                Total: Rs. {item.total ?? item.totalAmount ?? 'N/A'}
              </Text>
            </View>
          )}
        />
      )}

      {orders.length > 0 ? (
        <TouchableOpacity onPress={clearHistory} style={{ marginTop: 10, alignItems: 'center' }}>
          <Text style={{ color: '#999', fontSize: 12 }}>Clear History</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  card: {
    padding: 14, backgroundColor: '#f9f9f9',
    marginBottom: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#ddd'
  },
  orderId: { fontSize: 12, color: '#666' },
  status: { fontSize: 16, fontWeight: 'bold', marginTop: 4, color: '#d9534f' },
  total: { fontSize: 14, marginTop: 4, fontWeight: 'bold' },
  detail: { fontSize: 13, marginTop: 3, color: '#333' },
  empty: { marginTop: 20, color: '#666', textAlign: 'center' },
  error: { marginTop: 12, color: '#c00' },
  btn: {
    backgroundColor: '#d9534f', padding: 12,
    alignItems: 'center', borderRadius: 8, marginTop: 12
  },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
