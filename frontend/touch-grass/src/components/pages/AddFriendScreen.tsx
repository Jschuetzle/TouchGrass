// app/(tabs)/friends/add.tsx
import "reflect-metadata";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { getUserByUsername } from "@/api/users";
import { SendRequestIcon } from "@/components/icons/IconSet";
import FriendRow from "@/components/pages/FriendRow";
// import { UserResponseDto } from "@/dto/UserResponseDto"; // if you have this type, use it

const CURRENT_USER_ID = "6S1JRtTnFhdexT396rSoYchgCwW2"; // Replace with auth logic

export default function AddFriendScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]); // ideally use UserResponseDto[]
  const router = useRouter();

  const handleSearch = async () => {
    const trimmed = query.trim();

    if (!trimmed) {
      Alert.alert("Missing username", "Please enter a username to search.");
      return;
    }

    try {
      const user = await getUserByUsername(trimmed);

      console.log("User found:", user);

      // Wrap in array so FlatList works with a single result
      setResults([user]);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
      Alert.alert("User not found", "No user found with that username.");
    }
  };

  const handleSendRequest = async (toId: string) => {
    try {
      // await sendFriendRequest(toId);
      Alert.alert("Success", "Request sent!");
    } catch {
      Alert.alert("Error", "Request failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search for your next Friend!</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by username"
        placeholderTextColor="#aaa"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendRow
            name={item.username}
            id={item.id}
            icon={<SendRequestIcon />}
            onPush={() => handleSendRequest(item.id)}
          />
        )}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#25292e", padding: 20 },
  title: { color: "#fff", fontSize: 24, textAlign: "center", marginBottom: 30 },
  searchInput: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    color: "white",
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  searchButtonText: { color: "white", fontSize: 16 },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#444",
    padding: 12,
    marginVertical: 6,
    borderRadius: 5,
    alignItems: "center",
  },
  resultText: { color: "white", fontSize: 16 },
});
