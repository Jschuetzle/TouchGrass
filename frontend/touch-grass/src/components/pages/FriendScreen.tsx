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
import { fetchFriends, deleteFriend } from "@/services/friendService";
import { useRouter } from "expo-router";
import { SendRequestIcon } from "@/components/icons/IconSet";
import { useUserContext } from "@/contexts/UserContext";

const router = useRouter();

export default function FriendsScreen() {
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchText, setSearchText] = useState("");

  const loadFriends = async () => {
    try {
      const data = await fetchFriends();
      const friendList = data.results;
      setFriends(friendList);
      setFilteredFriends(friendList);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = () => {
    const result = friends.filter((f) =>
      f.username?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredFriends(result);
  };

  const handleDelete = async (friendId: string) => {
    try {
      await deleteFriend(friendId);
      const updated = filteredFriends.filter((f) => f.id !== friendId);
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
      setFilteredFriends(updated);
    } catch {
      Alert.alert("Error", "Could not remove friend.");
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    console.log("Filtered Friends:", filteredFriends);
  }, [filteredFriends]);

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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendRow
            name={item.username}
            id={item.id}
            icon={<SendRequestIcon />}
            onPush={handleDelete}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No friends found.</Text>
        }
        style={{ marginTop: 20 }}
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
