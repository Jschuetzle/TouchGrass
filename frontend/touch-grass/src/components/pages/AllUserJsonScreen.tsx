// src/components/pages/AllUsersJsonScreen.tsx

import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getUser } from '../../services/touch-grass';
import { getUsers } from '../../services/touch-grass';
import { useAuth } from '../../contexts/AuthContext';

export default function AllUsersJsonScreen() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getUser(user.uid);
        setData(result);
      } catch (err: any) {
        setError(err.message ?? 'Unknown error');
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend /users Response</Text>

      <ScrollView style={styles.scroll}>
        <Text selectable style={styles.json}>
          {error
            ? `❌ Error: ${error}`
            : data
            ? JSON.stringify(data, null, 2)
            : '⏳ Loading...'}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#25292e',
    paddingTop: 60,
    paddingHorizontal: 16,
    gap: 20,
    maxWidth: '80%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  scroll: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    maxHeight: 400,
  },
  json: {
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 14,
  },
});
