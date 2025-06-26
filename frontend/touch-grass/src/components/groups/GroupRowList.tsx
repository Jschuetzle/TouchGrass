// src/components/GroupList.tsx
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import GroupRow from './GroupRow';

const groups = [
  { id: '1', groupName: 'Friends' },
  { id: '2', groupName: 'Spike ballers' },
  { id: '3', groupName: 'Travel Buddies' },
];

export default function GroupRowList() {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.inner}>
        {groups.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <GroupRow groupName={item.groupName} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 25,
    flexGrow: 1,
  },
  inner: {
    flexDirection: 'column',
    gap: 16,
  },
  listItem: {
    // optional: shadow, background, etc.
  },
});
