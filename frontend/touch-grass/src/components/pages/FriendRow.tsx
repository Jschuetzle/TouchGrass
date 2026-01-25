import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FriendRowAction } from "@/common/types/friend";
import {
  SendRequestIcon,
  RequestSentIcon,
} from "@/components/icons/IconSet";

interface FriendRowProps {
  name: string;
  username: string;
  action: FriendRowAction;
  onPress: (username: string) => void;
}

export default function FriendRow({ name, username, action, onPress }: FriendRowProps) {
  const disabled = action === FriendRowAction.REQUEST_SENT;

  const renderIcon = () => {
    switch (action) {
      case FriendRowAction.SEND_REQUEST:
        return <SendRequestIcon />;

      case FriendRowAction.REQUEST_SENT:
        return <RequestSentIcon />;

      case FriendRowAction.DELETE_FRIEND:
        return <Ionicons name="trash-outline" size={24} color="white" />;

      case FriendRowAction.ACCEPT_REQUEST:
        return (
          <Ionicons
            name="checkmark-circle-outline"
            size={26}
            color="#4CAF50"
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.row}>
      <Text style={styles.name}>{name}</Text>

      <TouchableOpacity
        onPress={() => onPress(username)}
        disabled={disabled}
        style={disabled ? styles.disabledBtn : undefined}
      >
        {renderIcon()}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#444",
    padding: 12,
    marginVertical: 6,
    borderRadius: 5,
    alignItems: "center",
  },
  name: {
    color: "white",
    fontSize: 16,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
