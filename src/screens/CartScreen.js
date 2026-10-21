import React, { useContext, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Alert, ActivityIndicator
} from 'react-native';
import { request } from '../api/client';
import { CartContext } from '../context/CartContext';

export default function CartScreen({ navigation }) {
 const { cartState, clearCart } = useContext(CartContext);
const cartItems = cartState?.items || [];
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const handleCheckout = async () => {
    if (!cartItems.length) {
      Alert.alert('Cart Empty', 'Pehle Menu se food item add karein.');
      return;
    }

    const items = cartItems.map(item => ({
      menuItem: item._id || item.id,
      quantity: Number(item.quantity || 1),
      note: item.note || ''
    }));

    if (items.some(item => !item.menuItem)) {
      Alert.alert('Error', 'Cart item ki ID missing hai. Menu data check karna hoga.');
      return;
    }

    try {
      setLoading(true);

      // Takeaway order: fake table ID use nahi kar rahe.
      const response = await request('/orders', {
        method: 'POST',
        body: {
          items,
          type: 'takeaway',
          pickupTime: '20:00'
        }
      });

      Alert.alert('Success', 'Order place ho gaya!');
      clearCart();
      navigation.navigate('Tracking');
    } catch (error) {
      Alert.alert('Order Error', error.message || 'Order place nahi ho saka.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aapka Cart</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item, index) =>
          String(item._id || item.id || index)
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            Cart khaali hai. Menu se item add karein.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text>
              {item.name || item.title || 'Food Item'} x {item.quantity || 1}
            </Text>
            <Text>
              Rs. {Number(item.price || 0) * Number(item.quantity || 1)}
            </Text>
          </View>
        )}
      />

      <Text style={styles.total}>Total: Rs. {total}</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={handleCheckout}
        disabled={loading || cartItems.length === 0}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Place Order</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee'
  },
  empty: { marginTop: 20, color: '#666' },
  total: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  btn: {
    backgroundColor: '#d9534f', padding: 14,
    alignItems: 'center', borderRadius: 8, marginTop: 20
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
