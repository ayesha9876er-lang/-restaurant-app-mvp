import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';

import { request } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function ReservationScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [tableId, setTableId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReservation = async () => {
    setMessage('');
    setSuccess(false);

    // Required fields
    if (
      !tableId.trim() ||
      !date.trim() ||
      !time.trim() ||
      !partySize.trim() ||
      !contactPhone.trim()
    ) {
      setMessage('Please fill in all fields.');
      return;
    }

    // Date format and real date validation
    const dateValue = date.trim();
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);

    if (!dateMatch) {
      setMessage('Date format must be YYYY-MM-DD, e.g. 2026-10-20.');
      return;
    }

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);
    const parsedDate = new Date(year, month - 1, day);

    if (
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      setMessage('Please enter a valid calendar date.');
      return;
    }

    // Backend accepts hourly slots from 12:00 to 22:00
    const timeValue = time.trim();

    if (!/^(1[2-9]|2[0-2]):00$/.test(timeValue)) {
      setMessage(
        'Choose an hourly time from 12:00 to 22:00, e.g. 19:00.'
      );
      return;
    }

    // Guest count
    const guests = Number(partySize);

    if (!Number.isInteger(guests) || guests < 1 || guests > 12) {
      setMessage('Number of guests must be between 1 and 12.');
      return;
    }

    // Backend requires format 03XX-XXXXXXX
    const phoneValue = contactPhone.trim();

    if (!/^03\d{2}-\d{7}$/.test(phoneValue)) {
      setMessage(
        'Phone format must be 03XX-XXXXXXX, e.g. 0300-1234567.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await request('/reservations', {
        method: 'POST',
        body: {
          // Backend expects "table", not "tableId"
          table: tableId.trim(),
          date: dateValue,
          time: timeValue,
          partySize: guests,
          contactPhone: phoneValue,
        },
      });

      setSuccess(true);
      setMessage('Reservation request submitted successfully!');

      Alert.alert(
        'Reservation Submitted',
        'Your reservation request was submitted successfully.'
      );

      setTableId('');
      setDate('');
      setTime('');
      setPartySize('2');
      setContactPhone('');
    } catch (error) {
      const errorText =
        error?.message || 'Reservation could not be submitted.';

      setSuccess(false);
      setMessage(errorText);

      Alert.alert('Reservation Failed', errorText);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      color: theme.text,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Table Reservation
      </Text>

      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        {user?.name
          ? `Welcome, ${user.name}`
          : 'Book a table at our restaurant'}
      </Text>

      <TextInput
        placeholder="Table ID"
        placeholderTextColor={theme.secondaryText}
        value={tableId}
        onChangeText={setTableId}
        style={inputStyle}
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        placeholder="Date (YYYY-MM-DD)"
        placeholderTextColor={theme.secondaryText}
        value={date}
        onChangeText={setDate}
        style={inputStyle}
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        placeholder="Time (e.g. 19:00)"
        placeholderTextColor={theme.secondaryText}
        value={time}
        onChangeText={setTime}
        style={inputStyle}
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        placeholder="Number of guests (1-12)"
        placeholderTextColor={theme.secondaryText}
        value={partySize}
        onChangeText={setPartySize}
        keyboardType="number-pad"
        style={inputStyle}
        editable={!loading}
      />

      <TextInput
        placeholder="Phone (0300-1234567)"
        placeholderTextColor={theme.secondaryText}
        value={contactPhone}
        onChangeText={setContactPhone}
        keyboardType="phone-pad"
        style={inputStyle}
        autoCapitalize="none"
        editable={!loading}
      />

      {message ? (
        <Text
          accessibilityRole="alert"
          style={[
            styles.message,
            { color: success ? '#2E7D32' : '#D32F2F' },
          ]}
        >
          {message}
        </Text>
      ) : null}

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: theme.primary,
            opacity: loading ? 0.7 : 1,
          },
        ]}
        onPress={handleReservation}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Book Table</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 17,
  },
  message: {
    marginBottom: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  button: {
    padding: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    minHeight: 56,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
