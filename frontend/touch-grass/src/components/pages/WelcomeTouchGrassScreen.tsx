import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, ScrollView, Alert } from 'react-native';
import { AuthService } from '../../services/auth';
import { CreateUserDto } from '../../services/touch-grass';

// Props for the welcome screen
type WelcomeProps = {
  payload: Record<string, any>;
  onContinue?: (updatedPayload: Record<string, any>) => void;
};

export default function WelcomeTouchGrassScreen({ payload, onContinue }: WelcomeProps) {
  // Initialize state from payload
  const [username, setUsername] = useState(payload.username || '');
  const [firstname, setFirstname] = useState(payload.firstname || '');
  const [lastname, setLastname] = useState(payload.lastname || '');
  const [email, setEmail] = useState(payload.email || '');
  const [profilePic, setProfilePic] = useState(payload.profile_pic || '');
  const [phoneNumber, setPhoneNumber] = useState(payload.phone_number || '');

const handleContinue = () => {
  const updated: CreateUserDto = {
    id: payload.id, // Must be present in the original payload
    username,
    firstname,
    lastname,
    email,
    // only include profile_pic if it's short enough
    ...(profilePic.length <= 64 && { profile_pic: profilePic }),
    phone_number: phoneNumber || undefined,
  };

  onContinue?.(updated);
};


  const handleLogout = async () => {
    try {
      await AuthService.signOut();
    } catch (err: any) {
      Alert.alert('Authentication Error', err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Welcome to TouchGrass!</Text>
      <Text style={styles.subtitle}>Please confirm or edit your details:</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="username"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstname}
          onChangeText={setFirstname}
          placeholder="First Name"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastname}
          onChangeText={setLastname}
          placeholder="Last Name"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Profile Pic URL</Text>
        <TextInput
          style={styles.input}
          value={profilePic}
          onChangeText={setProfilePic}
          placeholder="https://..."
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="+15555555555"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Continue" onPress={handleContinue} />
      </View>

      <View style={styles.signOutContainer}>
        <Button title="Sign Out" onPress={handleLogout} color="red" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#25292e',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 16,
    textAlign: 'center',
  },
  field: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    color: '#aaa',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  buttonContainer: {
    marginTop: 24,
    width: '100%',
  },
  signOutContainer: {
    marginTop: 12,
    width: '100%',
  },
});