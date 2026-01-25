import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import FriendRow from "@/components/pages/FriendRow";
import { FriendRowAction } from "@/common/types/friend";
import {
  GetFriendRequests,
  AcceptFriendRequest,
  DeclineFriendRequest,
} from "@/api/friends";
import { TouchgrassUser } from "@/common/types/user";

type Props = {
  visible: boolean;
  onClose: () => void;

  // lets parent update badge count
  onCountChange?: (count: number) => void;

  // lets parent refresh friends after accept
  onAccepted?: (username: string) => void;
};

export default function FriendRequestsModal({
  visible,
  onClose,
  onCountChange,
  onAccepted,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<TouchgrassUser[]>([]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const result = await GetFriendRequests();
      const mapped = TouchgrassUser.fromGetFriendRequestsResponseDto(result);
      setRequests(mapped);
      onCountChange?.(mapped.length);
    } catch (err) {
      console.error("Failed to load friend requests:", err);
      setRequests([]);
      onCountChange?.(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const removeRequest = (username: string) => {
    setRequests((prev) => {
      const next = prev.filter((r) => r.username !== username);
      onCountChange?.(next.length);
      return next;
    });
  };

  const handleAccept = async (username: string) => {
    try {
      await AcceptFriendRequest(username);
      removeRequest(username);
      onAccepted?.(username);
      Alert.alert("Friend added!", `You are now friends with ${username}`);
    } catch (err) {
      console.error("Failed to accept friend request:", err);
      Alert.alert("Error", "Could not accept this request. Please try again.");
    }
  };

  const handleDecline = async (username: string) => {
    try {
      await DeclineFriendRequest(username);
      removeRequest(username);
      Alert.alert("Declined", `You declined ${username}'s request`);
    } catch (err) {
      console.error("Failed to decline friend request:", err);
      Alert.alert("Error", "Could not decline this request. Please try again.");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Your Friend Requests</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.refreshButton} onPress={loadRequests}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.username}
            ListEmptyComponent={
              <Text style={styles.empty}>No friend requests right now.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.row}>
                <FriendRow
                  name={item.username}
                  username={item.username}
                  action={FriendRowAction.ACCEPT_REQUEST}
                  onPress={(username) => handleAccept(username)}
                />

                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() => handleDecline(item.username)}
                >
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}
            style={{ marginTop: 20 }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#25292e", padding: 20 },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  actions: { flexDirection: "row", gap: 10 },
  refreshButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButtonText: { color: "white", fontSize: 16 },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#444",
  },
  closeButtonText: { color: "white", fontSize: 16 },

  empty: { color: "#aaa", fontSize: 18, textAlign: "center", marginTop: 40 },
  row: {
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  declineButton: {
    marginTop: 8,
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#b33939",
  },
  declineButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
