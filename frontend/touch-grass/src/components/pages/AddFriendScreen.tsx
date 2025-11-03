import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchUsers, sendFriendRequest } from '@/services/friendService'

const CURRENT_USER_ID = 'user123'; // TODO: Replace with actual auth context

export default function AddFriendScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const data = await searchUsers(query);
      setResults(data);
    } catch (err) {
      Alert.alert('Error', 'Could not search users.');
    }
  };

  const handleSendRequest = async (toId: string) => {
    try {
      await sendFriendRequest(CURRENT_USER_ID, toId);
      Alert.alert('Success', 'Friend request sent!');
    } catch {
      Alert.alert('Error', 'Could not send request.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.resultRow}>
      <Text style={styles.resultText}>{item.username}</Text>
      <TouchableOpacity onPress={() => handleSendRequest(item.id)}>
        <Ionicons name="checkmark-circle" size={28} color="#00e676" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find a New Friend 👋</Text>

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
        renderItem={renderItem}
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