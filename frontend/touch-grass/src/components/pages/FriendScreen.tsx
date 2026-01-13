import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FriendRow from "@/components/pages/FriendRow";
import { GetFriends, DeleteFriend, GetFriendRequests } from "@/api/friends"; 
import { useRouter, useFocusEffect } from "expo-router"; 
import { TouchgrassUser } from "@/common/types/user";

export default function FriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<TouchgrassUser[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<TouchgrassUser[]>([]);
  const [searchText, setSearchText] = useState("");

  // friend request indicator
  const [friendRequestCount, setFriendRequestCount] = useState(0);

  const loadFriends = async () => {
    const data = await GetFriends();
    const mapped = TouchgrassUser.fromGetFriendsResponseDto(data);
    setFriends(mapped);
    setFilteredFriends(mapped);
  };

  // load friend requests
  const loadFriendRequests = async () => {
    try {
      const dto = await GetFriendRequests();
      // dto.requests should exist based on your plainToInstance call
      setFriendRequestCount(dto?.requests?.length ?? 0);
    } catch (e) {
      console.error("Failed to load friend requests:", e);
      // Don't block the screen if this fails; just hide the badge
      setFriendRequestCount(0);
    }
  };

  const handleSearch = () => {
    const result = friends.filter((f) =>
      f.username?.toLowerCase().startsWith(searchText.toLowerCase())
    );
    setFilteredFriends(result);
  };

  const handleDelete = async (friendUsername: string) => {
    try {
      await DeleteFriend(friendUsername);

      setFriends((prev) => prev.filter((f) => f.username !== friendUsername));
      setFilteredFriends((prev) =>
        prev.filter((f) => f.username !== friendUsername)
      );
    } catch (e) {
      console.error("Delete error:", e);
      Alert.alert("Error", "Could not remove friend.");
    }
  };

  // Refresh whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFriends();
      loadFriendRequests();
    }, [])
  );

  // (Optional) keep your original initial load if you want; not required with useFocusEffect
  // useEffect(() => {
  //   loadFriends();
  //   loadFriendRequests();
  // }, []);

  const hasRequests = friendRequestCount > 0;

  return (
    <View style={styles.container}>
      {/* Top bar: Friends + Add button */}
      <View style={styles.topBar}>
        <Text style={styles.header}>See Your Friends!</Text>

        <View style={{ flexDirection: "row", gap: 20 }}>
          {/* Inbox - friend requests */}
          <TouchableOpacity onPress={() => router.push("/friends/requests")}>
            <View style={{ position: "relative" }}>
              <Ionicons
                name="mail-unread-outline"
                size={24}
                color={hasRequests ? "#4CAF50" : "white"} // ✅ highlight color
              />

              {/* badge */}
              {hasRequests && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {friendRequestCount > 99 ? "99+" : friendRequestCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Add friend */}
          <TouchableOpacity onPress={() => router.push("/friends/add")}>
            <Ionicons name="person-add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar and button */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search your friends..."
        placeholderTextColor="#aaa"
        autoCapitalize="none"
        value={searchText}
        onChangeText={setSearchText}
      />

      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>

      {/* Friend list */}
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.username}
        renderItem={({ item }) => (
          <FriendRow
            name={item.username}
            id={item.username}
            icon={<Ionicons name="trash-outline" size={24} color="white" />}
            onPush={() => handleDelete(item.username)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#25292e", padding: 20 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: { color: "white", fontSize: 24, fontWeight: "bold" },
  searchInput: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    color: "white",
    fontSize: 16,
    marginTop: 30,
  },
  searchButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  searchButtonText: { color: "white", fontSize: 16 },

  badge: {
    position: "absolute",
    top: -8,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
});
