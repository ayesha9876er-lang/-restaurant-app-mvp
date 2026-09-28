<div align="center">

# 🍽️ FeastFlow Restaurant App

### Restaurant App MVP — React Native + Expo | Fall 2026

A frontend-only React Native restaurant application featuring customer ordering, table reservations, live order tracking, menu browsing with search, cart management, light/dark themes, and a dedicated manager dashboard.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo SDK](https://img.shields.io/badge/Expo_SDK-54-000020?logo=expo&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Architecture](https://img.shields.io/badge/Architecture-Frontend_Only-8B5E3C)
![Course](https://img.shields.io/badge/Course-Mobile_App_Development-2E7D32)
![Term](https://img.shields.io/badge/Academic_Term-Fall_2026-B8860B)

</div>

---

## 🎥 Demo Video

### ▶️ Watch Full App Demo

[Open FeastFlow Restaurant Demo Video](ADD_YOUR_VIDEO_LINK_HERE)

The demo covers the complete Customer and Manager workflow: sign up, menu browsing, search, cart, promo codes, reservation, order placement, live order tracking, then manager login and order status update.

---

## 📱 App Preview

<table>
  <tr>
    <td align="center"><b>Login: validation errors</b><br><img src="screenshots/01-login-validation-errors.png" width="220"></td>
    <td align="center"><b>Login: successful login</b><br><img src="screenshots/02-login-success.png" width="220"></td>
    <td align="center"><b>Menu</b><br><img src="screenshots/03-menu.png" width="220"></td>
  </tr>
  <tr>
    <td align="center"><b>Search + render counter</b><br><img src="screenshots/04-search-render-counter.png" width="220"></td>
    <td align="center"><b>Profile (dark mode)</b><br><img src="screenshots/05-profile-dark-mode.png" width="220"></td>
    <td align="center"><b>Cart with promo code</b><br><img src="screenshots/06-cart-promo.png" width="220"></td>
  </tr>
  <tr>
    <td align="center"><b>Order summary (console)</b><br><img src="screenshots/07-order-summary-console.png" width="220"></td>
    <td align="center"><b>Reservation: disabled slot</b><br><img src="screenshots/08-reservation-disabled-slot.png" width="220"></td>
    <td align="center"><b>Order tracking</b><br><img src="screenshots/09-order-tracking.png" width="220"></td>
  </tr>
  <tr>
    <td align="center"><b>Manager dashboard</b><br><img src="screenshots/10-manager-dashboard.png" width="220"></td>
    <td></td>
    <td></td>
  </tr>
</table>

---

## ✨ Features

### 👤 Customer
- Sign up and log in with validation (email format, password of 8+ characters with a digit, matching passwords)
- Browse the menu by category (Starters, Mains, Desserts, Drinks) with Daily Special badges and greyed-out unavailable items
- Search with a 400ms debounce and a list of recent searches
- Cart with quantity stepper, special instructions, and promo codes (`WELCOME10`, `FEAST20`)
- Order summary with service charge, sales tax, and promo discount
- Table reservations with time slots, party size, and Pakistani phone validation
- Dine-in or takeaway orders with live order tracking (Pending, Preparing, Ready, Served)
- Light and dark theme

### 🧑‍🍳 Manager
- Role-based dashboard, visible only to managers
- Update order status
- Accept or decline reservations
- Add menu items, edit prices, and toggle availability (changes show up instantly in the customer menu)
- Orders, reservations, and menu edits saved with AsyncStorage

---

## 🛠️ Tech Stack

- React Native with Expo
- React Navigation (bottom tabs with nested stack navigation)
- React hooks: `useState`, `useEffect`, `useRef`, `useContext`, `useReducer`, `useMemo`, `useCallback`, `React.memo`, plus custom hooks
- AsyncStorage for local persistence
- No backend, no external API, no state-management library

---

## ⚙️ Prerequisites

| Requirement | Details |
|---|---|
| Node.js | 20 LTS or newer (check with `node -v`) |
| npm | Comes with Node.js |
| Expo Go app | Installed on your Android or iOS phone (Play Store / App Store) |
| Emulator (optional) | Android Studio with an Android Virtual Device, or Xcode Simulator on macOS |

---

## 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/ayesha9876er-lang/restaurant-app-mvp.git

# 2. Go into the project folder
cd restaurant-app-mvp

# 3. Install dependencies
npm install
```

## ▶️ Running the App

```bash
npx expo start
```

A QR code appears in the terminal.

**On a real phone (Expo Go):**
1. Make sure your phone and computer are on the same Wi-Fi network.
2. Open Expo Go and scan the QR code (Android: scan inside Expo Go; iOS: use the Camera app).
3. The app loads on your phone. Saved changes reload automatically.

**On an emulator:**
- Android: start an Android Virtual Device in Android Studio, then press `a` in the terminal running Expo.
- iOS (macOS only): press `i` to open the iOS Simulator.

### 🧰 Troubleshooting (Windows)

If `npx expo start` crashes with `TypeError: Invalid URL`, Expo could not pick the right network address. Set your computer's Wi-Fi IPv4 address (find it with `ipconfig`) and start again in the same terminal:

```powershell
$env:REACT_NATIVE_PACKAGER_HOSTNAME="<your-wifi-ipv4-address>"
npx expo start
```

---

## 🔑 Mock Login Credentials

| Role | Email | Password |
|---|---|---|
| Customer | `customer@test.com` | `password123` |
| Manager | `manager@restaurant.com` | `adminpassword` |

You can also create a new Customer or Manager account from Sign Up mode on the login screen. New accounts live in memory only and are cleared when the app reloads.

---

## 🪝 Hooks Used on Each Screen

| Screen | Hooks used | Purpose |
|---|---|---|
| Login / Signup (`LoginScreen`) | `useState`, `useAuth`, `useTheme` | Mode, controlled inputs, errors, show-password, and `isSubmitting` state; user stored in AuthContext |
| Menu (`MenuScreen`) | `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useTheme` | Simulated loading with cleanup, category filtering, header title, debounced search, back-to-top, render counter, sorting |
| Menu item card (`MenuItemCard`) | `React.memo` | Avoid re-rendering cards whose props did not change |
| Cart (`CartScreen`) | `useReducer` (via `CartContext`), `useTheme` | Add, remove, quantity, notes, and promo code handled by `cartReducer` |
| Order summary (`OrderSummaryScreen`) | `useMemo`, `useCallback` | Subtotal, service charge, tax, discount, and grand total |
| Reservation (`ReservationScreen`) | `useForm`, `useDebounce`, `useReservation` (custom hooks) | Form validation, availability checks, create and cancel reservations |
| Order tracking (`OrderTrackingScreen`) | `useEffect` + `setInterval`, `useReducer` (via `OrdersContext`) | Automatic status progress with timer cleanup |
| Profile (`ProfileScreen`) | `useAuth`, `useTheme` | Show user details, toggle theme, log out |
| Manager dashboard (`ManagerDashboardScreen`) | `useReducer` (via `OrdersContext`), `useCallback`, `React.memo`, `useEffect` | Manage orders, reservations, and menu; load and save AsyncStorage data |

---

## 🗂️ Project Structure

```
restaurant-app-mvp/
├── A1/
│   ├── SRS.pdf
│   └── UML/
│       ├── usecase-diagram.png
│       ├── class-diagram.png
│       ├── sequence-diagram.png
│       ├── state-diagram.png
│       └── component-diagram.png
├── screenshots/
├── src/
│   ├── components/      # MenuItemCard
│   ├── context/         # AuthContext, ThemeContext, CartContext, OrdersContext
│   ├── data/            # users.js, menu.js, tables.js
│   ├── hooks/           # useAuth, useTheme, useForm, useDebounce, useReservation
│   ├── navigation/      # AppNavigator (tabs + nested stack)
│   ├── reducers/        # cartReducer, ordersReducer
│   └── screens/         # Login, Menu, Cart, OrderSummary, Reservation, OrderTracking, Profile, ManagerDashboard
├── App.js
├── index.js
├── app.json
└── package.json
```

---

## 📝 Notes

### Why Context instead of prop drilling (Question 6)

Auth and theme data are needed by many screens at different depths of the navigation tree. With prop drilling, every navigator and screen in between would have to accept and forward `user` and `theme` props even though they never use them. Context lets any screen read this data directly through the `useAuth` and `useTheme` hooks. It also keeps the data in one place, so toggling dark mode updates the whole app instantly. The provider owns the state, and the consumers stay small and simple. One drawback is that every component consuming a context re-renders whenever the context value changes, even if it only uses a small part of that value.

### What happens if the filtering effect's dependency array is left empty (Question 4)

If the effect that builds `filteredItems` had an empty dependency array, it would run only once, right after the first render. At that moment `menuItems` is still empty because the menu loads after a 1.5 second delay, so `filteredItems` would be set to an empty list and stay that way. Tapping a category chip would change `selectedCategory`, but the effect would not run again, so the list would never update. The effect must depend on `selectedCategory` and `menuItems` so it re-runs whenever either one changes and keeps the displayed list in sync.
