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
import { getUserByUsername } from "@/api/users";
import FriendRow from "@/components/pages/FriendRow";
import { SendFriendRequest } from "@/api/friends";
import { TouchgrassUser } from "@/common/types/user";
import { FriendRowAction } from "@/common/types/friend";

export default function AddFriendScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TouchgrassUser[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    const trimmed = query.trim();

    if (!trimmed) {
      Alert.alert("Missing username", "Please enter a username to search.");
      return;
    }

    setHasSearched(true);

    try {
      const res = await getUserByUsername(trimmed);
      const dtos = res?.results ?? [];
      setResults(dtos.map((dto: any) => TouchgrassUser.fromDto(dto)));
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    }
  };

  const handleSendRequest = async (username: string) => {
    try {
      // prevent double-send spam taps
      if (sentRequests.has(username)) return;

      await SendFriendRequest(username);

      setSentRequests((prev) => {
        const next = new Set(prev);
        next.add(username);
        return next;
      });

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
        keyExtractor={(item, index) => item?.username ?? `row-${index}`}

        renderItem={({ item }) => {
          if (!item) return null;

          const alreadySent = sentRequests.has(item.username);

          return (
            <FriendRow
              name={item.username}
              username={item.username}
              action={
                alreadySent
                  ? FriendRowAction.REQUEST_SENT
                  : FriendRowAction.SEND_REQUEST
              }
              onPress={(username) => handleSendRequest(username)}
            />
          );
        }}
        ListEmptyComponent={
          hasSearched ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No user found</Text>
            </View>
          ) : null
        }
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
  emptyContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#aaa",
    fontSize: 16,
  },
});
