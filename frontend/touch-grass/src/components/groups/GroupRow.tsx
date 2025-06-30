// src/components/GroupRow.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  groupName: string;
};

export default function GroupRow({ groupName }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.groupName}>{groupName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#00d1ff',
    height: 75,
    justifyContent: 'center',
  },
  groupName: {
    paddingLeft: 20,
    color: 'white',
  },
});
