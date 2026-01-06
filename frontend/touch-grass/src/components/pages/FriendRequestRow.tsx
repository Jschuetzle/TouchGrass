import React, { ReactElement } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FriendRequestRowProps {
  name: string;
  id: string;
  icon: ReactElement;
  onPush: (id: string) => void;
}

export default function FriendRequestRow({ name, id, icon, onPush }: FriendRequestRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{name}</Text>
      <TouchableOpacity onPress={() => onPush(id)}>
        {icon}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#444',
    padding: 12,
    marginVertical: 6,
    borderRadius: 5,
  },
  name: {
    color: 'white',
    fontSize: 16,
  },
  delete: {
    color: '#ff4444',
    fontSize: 18,
  },
});