import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SendRequestIcon, RequestSentIcon } from "@/components/icons/IconSet";

interface FriendRowProps {
  name: string;
  id: string;
  requestSent: boolean;
  onPush: (id: string) => void;
}

export default function FriendRow({
  name,
  id,
  requestSent,
  onPush,
}: FriendRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{name}</Text>

      <TouchableOpacity
        onPress={() => onPush(id)}
        disabled={requestSent} // optional UX improvement
      >
        {requestSent ? <RequestSentIcon /> : <SendRequestIcon />}
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