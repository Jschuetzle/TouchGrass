// app/(tabs)/friends/add.tsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { searchUsers, sendFriendRequest } from '@/services/friendService';
import { SendRequestIcon } from '@/components/icons/IconSet';
import FriendRow from '@/components/pages/FriendRow';

const CURRENT_USER_ID = '6S1JRtTnFhdexT396rSoYchgCwW2'; // Replace with auth logic

export default function AddFriendScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const router = useRouter();

  const handleSearch = async () => {
    try {
      const data = await searchUsers(query);
      setResults(data);
    } catch {
      Alert.alert('Error', 'Search failed');
    }
  };

  const handleSendRequest = async (toId: string) => {
    try {
      await sendFriendRequest(CURRENT_USER_ID, toId);
      Alert.alert('Success', 'Request sent!');
    } catch {
      Alert.alert('Error', 'Request failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search for your next Friend!</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by username"
        placeholderTextColor="#aaa"
        value={query}
        onChangeText={setQuery}
      />

      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <FriendRow 
            name={item.username} 
            id={item.id}
            icon={<SendRequestIcon />}
            onPush={() => handleSendRequest(item.id)} />
        )}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e', padding: 20 },
  title: { color: '#fff', fontSize: 24, textAlign: 'center', marginBottom: 30 },
  searchInput: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    color: 'white',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: { color: 'white', fontSize: 16 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#444',
    padding: 12,
    marginVertical: 6,
    borderRadius: 5,
    alignItems: 'center',
  },
  resultText: { color: 'white', fontSize: 16 },
});