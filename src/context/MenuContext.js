import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { request } from '../api/client';

// Tumhare 5 Asli wale + 11 Naye = 16
const DEMO_MENU = [
  { _id: '1', id: '1', name: 'Chicken Biryani', description: 'Special chicken biryani with raita', price: 500, category: 'Mains', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
  { _id: '2', id: '2', name: 'Gulab Jamun', description: 'Hot gulab jamun', price: 300, category: 'Desserts', image: 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?w=400' },
  { _id: '3', id: '3', name: 'Vegetable Pasta', description: 'Creamy vegetable pasta', price: 650, category: 'Mains', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400' },
  { _id: '4', id: '4', name: 'Soft Drink', description: 'Chilled soft drink', price: 150, category: 'Drinks', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400' },
  { _id: '5', id: '5', name: 'Soup Of The Day', description: 'Fresh soup of the day', price: 350, category: 'Starters', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400' },
  { _id: '6', id: '6', name: 'Chicken Karahi', description: 'Desi style chicken karahi', price: 1200, category: 'Mains', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
  { _id: '7', id: '7', name: 'Chicken Tikka', description: 'Grilled chicken tikka', price: 650, category: 'Starters', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400' },
  { _id: '8', id: '8', name: 'Zinger Burger', description: 'Crispy zinger with fries', price: 580, category: 'Mains', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  { _id: '9', id: '9', name: 'Chicken Pizza', description: 'Cheesy chicken pizza', price: 1450, category: 'Mains', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
  { _id: '10', id: '10', name: 'Chocolate Cake', description: 'Soft chocolate cake slice', price: 400, category: 'Desserts', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
  { _id: '11', id: '11', name: 'Chicken Wings', description: 'Crispy fried wings', price: 550, category: 'Starters', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400' },
  { _id: '12', id: '12', name: 'Seekh Kabab', description: 'Grilled seekh kabab', price: 750, category: 'Starters', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400' },
  { _id: '13', id: '13', name: 'French Fries', description: 'Crispy golden fries', price: 300, category: 'Starters', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
  { _id: '14', id: '14', name: 'Mint Margarita', description: 'Fresh mint margarita', price: 300, category: 'Drinks', image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400' },
  { _id: '15', id: '15', name: 'Kheer', description: 'Special desi kheer', price: 250, category: 'Desserts', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
  { _id: '16', id: '16', name: 'Chai', description: 'Special doodh pati chai', price: 120, category: 'Drinks', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400' },
];

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [menuItems, setMenuItems] = useState(DEMO_MENU);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reloadMenu = useCallback(async () => {
    setLoading(true);
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
      const serverPromise = request('/menu');
      const res = await Promise.race([serverPromise, timeoutPromise]);
      const data = res?.data || res?.menu || res;
      // Server se 5 aaye to unko pics laga ke 16 poore karo
      if (Array.isArray(data) && data.length > 0) {
        const withPics = data.map((item) => {
          const found = DEMO_MENU.find((d) => d.name.toLowerCase() === item.name.toLowerCase());
          return { ...item, id: item._id || item.id, image: item.image || item.imageUrl || found?.image || '' };
        });
        // Agar Server se 5 aaye to baaki 11 Demo se jor do
        if (withPics.length < 16) {
          const names = withPics.map((i) => i.name.toLowerCase());
          const remaining = DEMO_MENU.filter((d) => !names.includes(d.name.toLowerCase()));
          setMenuItems([...withPics, ...remaining].slice(0, 16));
        } else {
          setMenuItems(withPics);
        }
        setError(null);
      }
    } catch (e) {
      setMenuItems(DEMO_MENU);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMenuItems(DEMO_MENU);
    reloadMenu();
  }, [reloadMenu]);

  return (
    <MenuContext.Provider value={{ menuItems, loading, error, reloadMenu, setMenuItems }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  return useContext(MenuContext);
}
export default MenuContext;