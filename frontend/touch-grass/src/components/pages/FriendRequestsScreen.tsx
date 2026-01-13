import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import FriendRow from "@/components/pages/FriendRow";
import { SendRequestIcon } from "@/components/icons/IconSet";
import { GetFriendRequests, AcceptFriendRequest, DeclineFriendRequest } from "@/api/friends";
import { TouchgrassUser } from "@/common/types/user";

export default function FriendRequestsScreen() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<TouchgrassUser[]>([]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const result = await GetFriendRequests();
      setRequests(TouchgrassUser.fromGetFriendRequestsResponseDto(result));
    } catch (err) {
      console.error("Failed to load friend requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const removeRequest = (username: string) => {
    setRequests((prev) => prev.filter((r) => r.username !== username));
  };

  const handleAccept = async (req: TouchgrassUser) => {
    try {
      await AcceptFriendRequest(req.username);

      removeRequest(req.username);

      Alert.alert("Friend added!", `You are now friends with ${req.username}`);
    } catch (err) {
      console.error("Failed to accept friend request:", err);
      Alert.alert("Error", "Could not accept this request. Please try again.");
    }
  };

  const handleDecline = async (req: TouchgrassUser) => {
    try {
      await DeclineFriendRequest(req.username);

      removeRequest(req.username);

      Alert.alert("Declined", `You declined ${req.username}'s request`);
    } catch (err) {
      console.error("Failed to decline friend request:", err);
      Alert.alert("Error", "Could not decline this request. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Friend Requests</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={loadRequests}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>

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
                id={item.username}
                icon={<SendRequestIcon />}
                onPush={() => handleAccept(item)}
              />
              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => handleDecline(item)}
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}
          style={{ marginTop: 20 }}
        />
      )}
    </View>
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
  refreshButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButtonText: { color: "white", fontSize: 16 },
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
