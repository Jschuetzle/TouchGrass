import React, { useState, useEffect } from "react";
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
import { getAllFriends, deleteFriend } from "@/api/friends";
import { useRouter } from "expo-router";
import { TouchgrassUser } from "@/common/types/user";

export default function FriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<TouchgrassUser[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<TouchgrassUser[]>([]);
  const [searchText, setSearchText] = useState("");



const loadFriends = async () => {
  const data = await getAllFriends();
  setFriends(TouchgrassUser.fromGetFriendsResponseDto(data));
  setFilteredFriends(TouchgrassUser.fromGetFriendsResponseDto(data));
};


  const handleSearch = () => {
    const result = friends.filter((f) =>
      f.username?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredFriends(result);
  };

  const handleDelete = async (friendUsername: string) => {
    try {
      await deleteFriend(friendUsername); // DELETE /friends { removedUsername }

      const updated = filteredFriends.filter(
        (f) => f.username !== friendUsername
      );
      setFriends((prev) => prev.filter((f) => f.username !== friendUsername));
      setFilteredFriends(updated);
    } catch (e) {
      console.error("Delete error:", e);
      Alert.alert("Error", "Could not remove friend.");
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top bar: Friends + Add button */}
      <View style={styles.topBar}>
        <Text style={styles.header}>See Your Friends!</Text>

        <View style={{ flexDirection: "row", gap: 20 }}>
          {/* Inbox - friend requests */}
          <TouchableOpacity onPress={() => router.push("/friends/requests")}>
            <Ionicons name="mail-unread-outline" size={24} color="white" />
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
  emptyText: { textAlign: "center", color: "#ccc", marginTop: 20 },
});
