require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Reservation = require('./models/Reservation');
const Order = require('./models/Order');

const menuItems = [
  { name: 'Chicken Spring Rolls', description: 'Crispy rolls stuffed with spiced chicken and vegetables, served with sweet chili sauce.', price: 450, category: 'Starters', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', isSpecial: false, isAvailable: true },
  { name: 'Loaded Nachos', description: 'Tortilla chips topped with melted cheese, jalapenos, salsa, and sour cream.', price: 550, category: 'Starters', image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400', isSpecial: true, isAvailable: true },
  { name: 'Chicken Wings', description: 'Spicy buffalo wings served with a side of ranch dip.', price: 650, category: 'Starters', image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400', isSpecial: false, isAvailable: true },
  { name: 'Soup of the Day', description: 'Chef\u2019s daily special soup, made fresh with seasonal vegetables.', price: 350, category: 'Starters', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', isSpecial: false, isAvailable: false },
  { name: 'Chicken Karahi', description: 'Traditional Pakistani karahi cooked with tomatoes, green chilies, and fresh spices.', price: 1200, category: 'Mains', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', isSpecial: true, isAvailable: true },
  { name: 'Beef Steak', description: 'Grilled beef steak served with mashed potatoes and sauteed vegetables.', price: 1500, category: 'Mains', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', isSpecial: false, isAvailable: true },
  { name: 'Chicken Biryani', description: 'Fragrant basmati rice layered with spiced chicken and caramelized onions.', price: 850, category: 'Mains', image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400', isSpecial: false, isAvailable: true },
  { name: 'Grilled Salmon', description: 'Fresh salmon fillet grilled to perfection with lemon butter sauce.', price: 1800, category: 'Mains', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', isSpecial: false, isAvailable: true },
  { name: 'Vegetable Pasta', description: 'Penne pasta tossed in creamy sauce with seasonal vegetables.', price: 750, category: 'Mains', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400', isSpecial: false, isAvailable: false },
  { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey molten center, served with vanilla ice cream.', price: 500, category: 'Desserts', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400', isSpecial: true, isAvailable: true },
  { name: 'New York Cheesecake', description: 'Classic creamy cheesecake with a buttery biscuit base.', price: 480, category: 'Desserts', image: 'https://images.unsplash.com/photo-1567327613485-fbc7bf196198?w=400', isSpecial: false, isAvailable: true },
  { name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup.', price: 300, category: 'Desserts', image: 'https://images.unsplash.com/photo-1601303516361-1c0f5f7f9c0b?w=400', isSpecial: false, isAvailable: true },
  { name: 'Fresh Lemonade', description: 'Chilled lemonade with fresh mint leaves.', price: 250, category: 'Drinks', image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400', isSpecial: false, isAvailable: true },
  { name: 'Mango Smoothie', description: 'Thick and creamy smoothie made with fresh mangoes and yogurt.', price: 350, category: 'Drinks', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', isSpecial: true, isAvailable: true },
  { name: 'Iced Coffee', description: 'Cold brewed coffee served over ice with a splash of milk.', price: 400, category: 'Drinks', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', isSpecial: false, isAvailable: true },
  { name: 'Soft Drink', description: 'Choice of Coke, Sprite, or Fanta, served chilled.', price: 150, category: 'Drinks', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400', isSpecial: false, isAvailable: false },
];

const tables = [
  { tableNumber: 1, name: 'Window Table 1', capacity: 2 },
  { tableNumber: 2, name: 'Window Table 2', capacity: 2 },
  { tableNumber: 3, name: 'Garden Table', capacity: 4 },
  { tableNumber: 4, name: 'Family Booth', capacity: 6 },
  { tableNumber: 5, name: 'Celebration Table', capacity: 8 },
  { tableNumber: 6, name: 'Private Dining', capacity: 12 },
];

const seed = async () => {
  await connectDB();

  // Empty all collections first so running the seed twice never creates duplicates.
  await Promise.all([
    User.deleteMany({}),
    MenuItem.deleteMany({}),
    Table.deleteMany({}),
    Reservation.deleteMany({}),
    Order.deleteMany({}),
  ]);

  // Passwords are stored hashed, never as plain text.
  const users = [
    { name: 'Customer User', email: 'customer@test.com', password: await bcrypt.hash('password123', 10), role: 'customer' },
    { name: 'Manager User', email: 'manager@restaurant.com', password: await bcrypt.hash('adminpassword', 10), role: 'manager' },
  ];

  await User.insertMany(users);
  await MenuItem.insertMany(menuItems);
  await Table.insertMany(tables);

  console.log(`Seeded: ${users.length} users, ${menuItems.length} menu items, ${tables.length} tables`);
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});