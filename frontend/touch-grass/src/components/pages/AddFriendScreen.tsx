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
import { SendRequestIcon } from "@/components/icons/IconSet";
import FriendRow from "@/components/pages/FriendRow";
import { SendFriendRequest } from "@/api/friends";
import { TouchgrassUser } from "@/common/types/user";


export default function AddFriendScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TouchgrassUser[]>([]); // ideally use UserResponseDto[]
  const [hasSearched, setHasSearched] = useState(false);


  const handleSearch = async () => {
    const trimmed = query.trim();

    if (!trimmed) {
      Alert.alert("Missing username", "Please enter a username to search.");
      return;
    }

    setHasSearched(true);

    try {
      // now returns: { total, page, limit, results: SearchUserDto[] }
      const res = await getUserByUsername(trimmed); // (or getUserByUsername if you kept the name)

      const dtos = res?.results ?? [];
      console.log(dtos)
      setResults(dtos.map((dto: any) => TouchgrassUser.fromDto(dto)));
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    }
  };



  const handleSendRequest = async (username: string) => {
    try {
      await SendFriendRequest(username);
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

        return (
          <FriendRow
            name={item.username}
            id={item.username}
            icon={<SendRequestIcon />}
            onPush={() => handleSendRequest(item.username)}
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
  emptyContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#aaa",
    fontSize: 16,
  },
});
