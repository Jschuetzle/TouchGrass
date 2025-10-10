// src/components/pages/AllUsersJsonScreen.tsx

import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getDashboard } from '@/api/dashboard';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend /users Response</Text>

      <ScrollView style={styles.scroll}>
        <Text selectable style={styles.json}>
          {"Hello"}
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
