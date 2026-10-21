
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity
} from 'react-native';
import { request } from '../api/client';

export default function OrderTrackingScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setError('');

      // BASE_URL mein /api pehle se included hai.
      const response = await request('/orders/my');

      const list = Array.isArray(response)
        ? response
        : response?.orders || response?.data || [];

      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Orders load nahi ho sake.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d9534f" />
        <Text>Orders load ho rahe hain...</Text>
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
              Abhi koi order nahi hai. Pehle Cart se order place karein.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.orderId}>
                Order ID: {item._id || item.id || 'N/A'}
              </Text>
              <Text style={styles.status}>
                Status: {item.status || 'Pending'}
              </Text>
              <Text style={styles.total}>
                Total: Rs. {item.total ?? item.totalAmount ?? 'N/A'}
              </Text>
            </View>
          )}
        />
      )}
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
  total: { fontSize: 14, marginTop: 4 },
  empty: { marginTop: 20, color: '#666' },
  error: { marginTop: 12, color: '#c00' },
  btn: {
    backgroundColor: '#d9534f', padding: 12,
    alignItems: 'center', borderRadius: 8, marginTop: 12
  },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
