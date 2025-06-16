import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { signUp, signInEmail } from '../../services/auth';

export default function LoginScreen() {
  const [email, setEmail]   = useState('');
  const [pwd, setPwd]       = useState('');
  const [isSignUp, setMode] = useState(false);

  const handleEmailAuth = async () => {
    try {
      if (isSignUp) {
        await signUp(email, pwd);
      } else {
        await signInEmail(email, pwd);
      }
    } catch (err: any) {
      Alert.alert('Authentication Error', err.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
        {isSignUp ? 'Create account' : 'Welcome back'}
      </Text>

      <TextInput
        placeholder="e-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />
      <TextInput
        placeholder="password"
        secureTextEntry
        value={pwd}
        onChangeText={setPwd}
        style={{ borderWidth: 1, padding: 8, marginBottom: 16 }}
      />

      <Button
        title={isSignUp ? 'Sign Up' : 'Sign In'}
        onPress={handleEmailAuth}
      />

      <View style={{ height: 24 }} />

      <Text
        style={{ textAlign: 'center', color: 'gray' }}
        onPress={() => setMode(!isSignUp)}
      >
        {isSignUp ? 'Already have an account? Sign in' : "No account? Sign up"}
      </Text>
    </View>
  );
}
