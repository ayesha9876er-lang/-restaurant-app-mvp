import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Alert, ActivityIndicator, TextInput, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { request } from '../api/client';
import { CartContext } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const { cartState, clearCart } = useContext(CartContext);
  const cartItems = cartState?.items || [];
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const [orderType, setOrderType] = useState('dine-in');
  const [pickupTime, setPickupTime] = useState('20:00');

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [tableNo, setTableNo] = useState('');

  const LOCAL_TABLES = Array.from({ length: 20 }, (_, i) => ({
    _id: `local-${i + 1}`,
    id: `local-${i + 1}`,
    number: i + 1,
    tableNumber: i + 1,
    name: `Table ${i + 1}`,
    status: 'Available',
  }));

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  useEffect(() => {
    if (orderType === 'dine-in') {
      loadTables();
    }
  }, [orderType]);

  const loadTables = async () => {
    try {
      setLoadingTables(true);
      const saved = await AsyncStorage.getItem('my_tables');
      if (saved) {
        const savedList = JSON.parse(saved);
        if (savedList && savedList.length > 0) {
          setTables(savedList);
          if (!selectedTable) setSelectedTable(savedList[0]);
        }
      } else {
        setTables(LOCAL_TABLES);
        if (!selectedTable) setSelectedTable(LOCAL_TABLES[0]);
      }
      const res = await request('/tables', { method: 'GET' });
      const list = Array.isArray(res) ? res : (res?.tables || res?.data || []);
      if (list && list.length > 0) {
        setTables(list);
        await AsyncStorage.setItem('my_tables', JSON.stringify(list));
        if (!selectedTable) setSelectedTable(list[0]);
      }
    } catch (e) {
      console.log('Server nahi mila, local tables dikha rahe hain');
      if (tables.length === 0) {
        setTables(LOCAL_TABLES);
        if (!selectedTable) setSelectedTable(LOCAL_TABLES[0]);
      }
    } finally {
      setLoadingTables(false);
    }
  };

  const handleCheckout = async () => {
    setMsg('');
    if (!cartItems.length) {
      setMsg('Cart is empty.');
      return;
    }

    if (orderType === 'dine-in' && !selectedTable && !tableNo.trim()) {
      setMsg('Please select a Table.');
      return;
    }

    const items = cartItems.map(item => {
      const rawId = item._id ?? item.id;
      const menuItem = rawId && String(rawId) !== 'undefined' && String(rawId) !== 'null' ? String(rawId) : null;
      return { menuItem, quantity: Number(item.quantity || 1), note: item.note || '' };
    });

    if (items.some(item => !item.menuItem)) {
      setMsg('Cart item ID is missing. Please clear cart and add again.');
      return;
    }

    try {
      setLoading(true);

      const finalTableNo = selectedTable
        ? (selectedTable.number ?? selectedTable.tableNumber ?? selectedTable.name ?? tableNo.trim())
        : tableNo.trim();

      const body = {
        items,
        type: orderType,
        orderType: orderType,
      };

      if (orderType === 'dine-in') {
        const tableId = selectedTable ? (selectedTable._id || selectedTable.id) : tableNo.trim();
        body.table = tableId;
        body.tableId = tableId;
        body.tableNumber = finalTableNo;
        body.tableNo = finalTableNo;
      } else {
        body.pickupTime = pickupTime;
      }

      // ===== FIX YAHAN HAI =====
      // Ab pehle server ko bhejenge, agar server fail hua to yahin ruk jayenge
      let response = null;
      try {
        response = await request('/orders', { method: 'POST', body });
      } catch (serverError) {
        console.log('Server me order nahi gaya:', serverError.message);
        setMsg('Server se connect nahi hua! Backend on karo, order database me nahi gaya.');
        setLoading(false);
        return; // Yahan se aage MAT jao, cart khali MAT karo
      }

      // Agar yahan tak aa gaye, matlab order sach me MongoDB me save ho gaya
      const serverOrder = response?.order || response;

      const localOrder = {
        _id: serverOrder?._id || `local-order-${Date.now()}`,
        id: serverOrder?._id || `local-order-${Date.now()}`,
        items: cartItems,
        total: total,
        type: orderType,
        orderType: orderType,
        tableNumber: orderType === 'dine-in' ? String(finalTableNo) : null,
        tableNo: orderType === 'dine-in' ? String(finalTableNo) : null,
        pickupTime: orderType === 'takeaway' ? pickupTime : null,
        status: 'Placed',
        createdAt: new Date().toISOString(),
        serverOrder: serverOrder,
        synced: true,
      };

      const oldOrders = await AsyncStorage.getItem('my_orders');
      const allOrders = oldOrders ? JSON.parse(oldOrders) : [];
      allOrders.unshift(localOrder);
      await AsyncStorage.setItem('my_orders', JSON.stringify(allOrders));
      await AsyncStorage.setItem('last_order', JSON.stringify(localOrder));

      setMsg('Order Placed Successfully! ✅');
      clearCart();
      setTimeout(() => {
        navigation.navigate('Tracking', { order: localOrder });
      }, 800);
    } catch (error) {
      // Ab yahan jhoota Success nahi likhenge
      setMsg('Order fail ho gaya: ' + (error.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  const getTableLabel = (t) => {
    if (t.number !== undefined) return `Table ${t.number}`;
    if (t.tableNumber !== undefined) return `Table ${t.tableNumber}`;
    if (t.name) return t.name;
    return 'Table';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <TouchableOpacity onPress={() => { setOrderType('dine-in'); setMsg(''); }} style={[styles.typeBtn, { backgroundColor: orderType === 'dine-in' ? '#d9534f' : '#EEE' }]}>
          <Text style={[styles.typeText, { color: orderType === 'dine-in' ? '#FFF' : '#000' }]}>Dine In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setOrderType('takeaway'); setMsg(''); }} style={[styles.typeBtn, { backgroundColor: orderType === 'takeaway' ? '#d9534f' : '#EEE' }]}>
          <Text style={[styles.typeText, { color: orderType === 'takeaway' ? '#FFF' : '#000' }]}>Takeaway</Text>
        </TouchableOpacity>
      </View>

      {orderType === 'dine-in' ? (
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Select Table:</Text>
          {loadingTables ? <ActivityIndicator /> : null}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {tables.map((t) => {
                const id = t._id || t.id;
                const isSel = selectedTable && (selectedTable._id || selectedTable.id) === id;
                return (
                  <TouchableOpacity key={String(id)} onPress={() => { setSelectedTable(t); setTableNo(String(t.number ?? t.tableNumber ?? '')); }} style={[styles.tableBtn, { backgroundColor: isSel ? '#d9534f' : '#EEE' }]}>
                    <Text style={{ color: isSel ? '#FFF' : '#000', fontWeight: 'bold' }}>{getTableLabel(t)}</Text>
                    {t.status ? <Text style={{ color: isSel ? '#FFF' : '#666', fontSize: 11 }}>{t.status}</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Or Enter Table No:</Text>
          <TextInput style={styles.input} placeholder="Table No. e.g. 5" value={tableNo} onChangeText={(text) => { setTableNo(text); if (text.trim()) setSelectedTable(null); }} keyboardType="number-pad" />
        </View>
      ) : (
        <TextInput style={styles.input} placeholder="Pickup Time e.g. 20:00" value={pickupTime} onChangeText={setPickupTime} />
      )}

      <FlatList
        data={cartItems}
        keyExtractor={(item, index) => String(item._id || item.id || index)}
        ListEmptyComponent={<Text style={styles.empty}>Cart is empty. Add items from Menu.</Text>}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text>{item.name || item.title || 'Food Item'} x {item.quantity || 1}</Text>
            <Text>Rs. {Number(item.price || 0) * Number(item.quantity || 1)}</Text>
          </View>
        )}
      />

      <Text style={styles.total}>Total: Rs. {total}</Text>
      {msg ? <Text style={[styles.msg, { color: msg.includes('nahi') || msg.includes('fail') ? 'red' : 'green' }]}>{msg}</Text> : null}

      <TouchableOpacity style={styles.btn} onPress={handleCheckout} disabled={loading || cartItems.length === 0}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Place Order</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  typeText: { fontWeight: 'bold' },
  tableBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  empty: { marginTop: 20, color: '#666' },
  total: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  msg: { color: 'green', fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  btn: { backgroundColor: '#d9534f', padding: 14, alignItems: 'center', borderRadius: 8, marginTop: 20 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});