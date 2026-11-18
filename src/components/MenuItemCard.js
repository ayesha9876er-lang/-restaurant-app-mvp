import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function MenuItemCard({ item, theme, onAddToCart }) {
  // Agar Server se isAvailable na aaye to usko Available hi samjho
  const isAvailable = item.isAvailable !== false;
  
  // Agar image khali ho to ye wali pic dikhao, khali mat choro
  const imageUrl = item.image || item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, opacity: isAvailable ? 1 : 0.5 }]}>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image} 
        resizeMode="cover"
      />

      {item.isSpecial && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Daily Special</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.description, { color: theme.secondaryText }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.price, { color: theme.primary }]}>Rs. {item.price}</Text>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: isAvailable ? theme.primary : '#999' }]}
            onPress={() => onAddToCart(item)}
            disabled={!isAvailable}
          >
            <Text style={styles.addButtonText}>
              {isAvailable ? 'Add' : 'Unavailable'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: 12, marginHorizontal: 16, marginVertical: 6, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, backgroundColor: '#fff', minHeight: 90 },
  image: { width: 90, height: 90, backgroundColor: '#eee' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#E63946', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, zIndex: 1 },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  info: { flex: 1, padding: 10, justifyContent: 'space-between' },
  name: { fontSize: 15, fontWeight: 'bold' },
  description: { fontSize: 12, marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  price: { fontSize: 15, fontWeight: 'bold' },
  addButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});