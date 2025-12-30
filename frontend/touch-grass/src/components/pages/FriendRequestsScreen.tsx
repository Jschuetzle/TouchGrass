// app/(tabs)/friends/add.tsx
import "reflect-metadata";
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

/* ------------------------------------------------------
   📌 IMAGINARY DTO + MOCK DATA (FOR DEMO)
-------------------------------------------------------*/
class FriendRequestDto {
  constructor(
    public id: string,
    public fromUserId: string,
    public fromUsername: string
  ) {}
}

// pretend these came from backend
const MOCK_REQUESTS: FriendRequestDto[] = [
  new FriendRequestDto("req1", "user111", "ShadowNinja"),
  new FriendRequestDto("req2", "user222", "PixelPirate"),
  new FriendRequestDto("req3", "user333", "GalaxyFox"),
];

/* ------------------------------------------------------
   🚨 FOR DEMO - Fake API Functions
-------------------------------------------------------*/
const getIncomingFriendRequests = async (): Promise<FriendRequestDto[]> =>
  new Promise((resolve) => setTimeout(() => resolve(MOCK_REQUESTS), 600));

const acceptFriendRequest = async (id: string) =>
  new Promise((resolve) => setTimeout(resolve, 300));

const declineFriendRequest = async (id: string) =>
  new Promise((resolve) => setTimeout(resolve, 300));

/* ------------------------------------------------------
   📺 SCREEN
-------------------------------------------------------*/
export default function FriendRequestsScreen() {
  const [requests, setRequests] = useState<FriendRequestDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    const data = await getIncomingFriendRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (req: FriendRequestDto) => {
    await acceptFriendRequest(req.id);
    Alert.alert("Friend added!", `You are now friends with ${req.fromUsername}`);
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
  };

  const handleDecline = async (req: FriendRequestDto) => {
    await declineFriendRequest(req.id);
    Alert.alert("Declined", `You declined ${req.fromUsername}'s request`);
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
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
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.empty}>No friend requests right now.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <FriendRow
                name={item.fromUsername}
                id={item.fromUserId}
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

/* ------------------------------------------------------
   🎨 STYLES
-------------------------------------------------------*/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#25292e", padding: 20 },
  title: { color: "#fff", fontSize: 28, fontWeight: "600", textAlign: "center", marginBottom: 20 },

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
