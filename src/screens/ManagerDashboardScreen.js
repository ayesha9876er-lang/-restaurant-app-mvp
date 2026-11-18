import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, RefreshControl } from 'react-native';
import { useMenu } from '../context/MenuContext';

const MOCK_ORDERS = [
  { _id: 'ORD-101', status: 'Pending', total: 850, customer: 'Ali' },
  { _id: 'ORD-102', status: 'Preparing', total: 1200, customer: 'Sara' },
];

export default function ManagerDashboardScreen() {
  const { menuItems, updatePrice } = useMenu();
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [menuError, setMenuError] = useState('');
  const [menuMessage, setMenuMessage] = useState('');

  const refreshDashboard = async () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); setMenuMessage('Dashboard refreshed!'); }, 800);
  };
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
  };
  const startEditingPrice = (item) => {
    setEditingId(String(item.id)); setNewPrice(String(item.price)); setMenuMessage(''); setMenuError('');
  };
  const savePrice = (item) => {
    const price = Number(newPrice.trim());
    if (!newPrice.trim() || !Number.isFinite(price) || price < 0) { setMenuError('Please enter valid price'); return; }
    updatePrice(item.id, price);
    setEditingId(null); setNewPrice('');
    setMenuMessage(`${item.name} price updated to Rs. ${price} - Customer app me bhi update ho gaya!`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshDashboard} />} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Manager Dashboard</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={refreshDashboard}><Text style={styles.btnText}>{refreshing ? 'Refreshing...' : 'Refresh Dashboard'}</Text></TouchableOpacity>
      {menuError ? <Text style={styles.error}>{menuError}</Text> : null}
      {menuMessage ? <Text style={styles.success}>{menuMessage}</Text> : null}
      <Text style={styles.sectionTitle}>Menu Management ({menuItems.length} items)</Text>
      <Text style={styles.helper}>Edit price - Customer app me foran update hoga!</Text>
      {menuItems.map((item) => {
        const id = String(item.id); const isEditing = editingId === id;
        return (
          <View key={id} style={styles.card}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.text}>Category: {item.category} | Price: Rs. {item.price}</Text>
            {isEditing ? (
              <>
                <TextInput style={styles.priceInput} value={newPrice} onChangeText={setNewPrice} placeholder="Enter new price" keyboardType="decimal-pad" />
                <View style={styles.row}>
                  <TouchableOpacity style={[styles.actionBtn, styles.saveButton]} onPress={() => savePrice(item)}><Text style={styles.btnText}>Save Price</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.cancelButton]} onPress={() => setEditingId(null)}><Text style={styles.btnText}>Cancel</Text></TouchableOpacity>
                </View>
              </>
            ) : (<TouchableOpacity style={styles.editButton} onPress={() => startEditingPrice(item)}><Text style={styles.btnText}>Edit Price</Text></TouchableOpacity>)}
          </View>
        );
      })}
      <Text style={styles.sectionTitle}>Orders</Text>
      {orders.map((item) => (
        <View key={item._id} style={styles.card}>
          <Text style={styles.text}>Order: {item._id} | Customer: {item.customer}</Text>
          <Text style={styles.text}>Status: <Text style={styles.status}>{item.status}</Text> | Total: Rs. {item.total}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f0ad4e' }]} onPress={() => updateOrderStatus(item._id, 'Preparing')}><Text style={styles.btnText}>Preparing</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.readyButton]} onPress={() => updateOrderStatus(item._id, 'Ready')}><Text style={styles.btnText}>Ready</Text></TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: 16, paddingBottom: 36 },
  title: { fontSize: 23, fontWeight: 'bold', marginBottom: 14, color: '#222' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', marginTop: 18, marginBottom: 6 },
  helper: { color: '#555', marginBottom: 12 }, error: { color: '#d9534f', marginBottom: 10 }, success: { color: '#218838', marginBottom: 10, fontWeight: '600' },
  card: { padding: 12, backgroundColor: '#f9f9f9', marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  itemName: { fontSize: 17, fontWeight: 'bold', marginBottom: 6, color: '#222' }, text: { fontSize: 14, marginBottom: 5, color: '#222' }, status: { fontWeight: 'bold', color: '#d9534f' },
  row: { flexDirection: 'row', marginTop: 8, gap: 8 }, actionBtn: { flex: 1, padding: 10, borderRadius: 5, alignItems: 'center' },
  editButton: { backgroundColor: '#0275d8', padding: 11, borderRadius: 5, alignItems: 'center', marginTop: 8 },
  saveButton: { backgroundColor: '#218838' }, cancelButton: { backgroundColor: '#6c757d' }, readyButton: { backgroundColor: '#5cb85c' },
  refreshButton: { backgroundColor: '#d9534f', padding: 11, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' }, priceInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginTop: 8, color: '#222' },
}); 