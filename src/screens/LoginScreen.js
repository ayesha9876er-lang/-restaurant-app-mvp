import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function LoginScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const { login, signup } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === 'signup' && !fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    const hasDigit = /\d/.test(password);
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (mode === 'signup' && (password.length < 8 || !hasDigit)) {
      newErrors.password = 'Password must be at least 8 characters and contain a digit';
    }

    if (mode === 'signup' && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    // The server now does the real work, so the fake 1 second delay is gone.
    const result =
      mode === 'login'
        ? await login(email.trim(), password)
        : await signup(fullName.trim(), email.trim(), password);

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.message);
      Alert.alert(mode === 'login' ? 'Login Failed' : 'Signup Failed', result.message);
    }
    // On success the navigator switches screens by itself (user is now set).
  };

  const switchMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setErrors({});
    setServerError('');
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
        <Text style={{ color: theme.text }}>{isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>FlowFeast Restaurant</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>
        {mode === 'login' ? 'Sign in to continue' : 'Create a new account'}
      </Text>

      <View style={styles.inputContainer}>
        {mode === 'signup' && (
          <>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: errors.fullName ? '#E63946' : theme.border }]}
              placeholder="Full Name"
              placeholderTextColor={theme.placeholder}
              value={fullName}
              onChangeText={(t) => { setFullName(t); clearError('fullName'); }}
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </>
        )}

        <TextInput
          style={[styles.input, { color: theme.text, borderColor: errors.email ? '#E63946' : theme.border }]}
          placeholder="Email"
          placeholderTextColor={theme.placeholder}
          value={email}
          onChangeText={(t) => { setEmail(t); clearError('email'); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <View style={[styles.passwordRow, { borderColor: errors.password ? '#E63946' : theme.border }]}>
          <TextInput
            style={[styles.passwordInput, { color: theme.text }]}
            placeholder="Password"
            placeholderTextColor={theme.placeholder}
            value={password}
            onChangeText={(t) => { setPassword(t); clearError('password'); }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
            <Text style={{ color: theme.text }}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        {mode === 'signup' && (
          <>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: errors.confirmPassword ? '#E63946' : theme.border }]}
              placeholder="Confirm Password"
              placeholderTextColor={theme.placeholder}
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </>
        )}

        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary, opacity: isSubmitting ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{mode === 'login' ? 'Log In' : 'Sign Up'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={switchMode} style={styles.switchModeButton}>
          <Text style={{ color: theme.primary }}>
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'login' && (
        <View style={[styles.hintContainer, { borderColor: theme.border }]}>
          <Text style={[styles.hintTitle, { color: theme.text }]}>Demo Credentials:</Text>
          <Text style={{ color: theme.text }}>Customer: customer@test.com / password123</Text>
          <Text style={{ color: theme.text, marginTop: 5 }}>Manager: manager@restaurant.com / adminpassword</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  themeToggle: { position: 'absolute', top: 50, right: 20, padding: 10 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  inputContainer: { width: '100%' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 4, fontSize: 16 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 4 },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  errorText: { color: '#E63946', fontSize: 12, marginBottom: 10 },
  serverError: { color: '#E63946', fontSize: 14, marginTop: 8, textAlign: 'center' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  switchModeButton: { marginTop: 16, alignItems: 'center' },
  hintContainer: { marginTop: 30, padding: 15, borderRadius: 8, borderWidth: 1 },
  hintTitle: { fontWeight: 'bold', marginBottom: 8 },
});
