import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FriendRow from "@/components/pages/FriendRow";
import { GetFriends, DeleteFriend, GetFriendRequests } from "@/api/friends";
import { useRouter, useFocusEffect } from "expo-router";
import { TouchgrassUser } from "@/common/types/user";
import FriendRequestsPanel from "@/components/pages/FriendRequestModal";
import { FriendRowAction } from "@/common/types/friend";

export default function FriendsScreen() {
  const router = useRouter();

  type UserMap = Record<string, TouchgrassUser>;

  const [friendsByUsername, setFriendsByUsername] = useState<UserMap>({});
  const [filteredByUsername, setFilteredByUsername] = useState<UserMap>({});
  const [searchText, setSearchText] = useState("");

  // friend request indicator
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const hasRequests = friendRequestCount > 0;

  // friend requests (used by modal)
  const [friendRequests, setFriendRequests] = useState<TouchgrassUser[]>([]);
  const [requestsOpen, setRequestsOpen] = useState(false);

  // loading
  const [loading, setLoading] = useState(true);

  const loadFriends = async () => {
    const data = await GetFriends();
    const mapped = TouchgrassUser.fromGetFriendsResponseDto(data);

    const asMap: UserMap = {};
    for (const u of mapped) {
      if (u?.username) asMap[u.username] = u;
    }

    setFriendsByUsername(asMap);
    setFilteredByUsername(asMap); // default: show all
  };

  const loadFriendRequests = async () => {
    try {
      const dto = await GetFriendRequests();
      setFriendRequestCount(dto?.requests?.length ?? 0);
      setFriendRequests(TouchgrassUser.fromGetFriendRequestsResponseDto(dto));
    } catch (e) {
      console.error("Failed to load friend requests:", e);
      setFriendRequestCount(0);
    }
  };

  const refresh = useCallback(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        await Promise.all([loadFriends(), loadFriendRequests()]);
      } catch (e) {
        console.error("Failed to refresh friends screen:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // cleanup so we don't set state after leaving screen
    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh whenever this screen comes into focus
  useFocusEffect(refresh);

  const handleSearch = () => {
    const q = searchText.trim().toLowerCase();

    if (!q) {
      setFilteredByUsername(friendsByUsername);
      return;
    }

    const next: UserMap = {};
    for (const [username, user] of Object.entries(friendsByUsername)) {
      if (username.toLowerCase().startsWith(q)) {
        next[username] = user;
      }
    }
    setFilteredByUsername(next);
  };

  const handleDelete = async (friendUsername: string) => {
    try {
      await DeleteFriend(friendUsername);

      setFriendsByUsername((prev) => {
        const { [friendUsername]: _removed, ...rest } = prev;
        return rest;
      });

      setFilteredByUsername((prev) => {
        const { [friendUsername]: _removed, ...rest } = prev;
        return rest;
      });
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
  const filteredFriendsArray = Object.values(filteredByUsername);

  // Full-screen loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top bar: Friends + Add button */}
      <View style={styles.topBar}>
        <Text style={styles.header}>See Your Friends!</Text>

        <View style={{ flexDirection: "row", gap: 20 }}>
          {/* Inbox - friend requests */}
          <TouchableOpacity onPress={() => setRequestsOpen(true)}>
            <View style={{ position: "relative" }}>
              <Ionicons
                name="mail-unread-outline"
                size={24}
                color={hasRequests ? "#4CAF50" : "white"}
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
        data={filteredFriendsArray}
        keyExtractor={(item) => item.username}
        renderItem={({ item }) => (
          <FriendRow
            name={item.username}
            username={item.username}
            action={FriendRowAction.DELETE_FRIEND}
            onPress={() => handleDelete(item.username)}
          />
        )}
        refreshing={loading}
        onRefresh={async () => {
          setLoading(true);
          try {
            await Promise.all([loadFriends(), loadFriendRequests()]);
          } catch (e) {
            console.error("Refresh failed:", e);
          } finally {
            setLoading(false);
          }
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchText.trim()
              ? "No friends match your search."
              : "You don't have any friends yet."}
          </Text>
        }
      />

      <FriendRequestsPanel
        visible={requestsOpen}
        onClose={() => setRequestsOpen(false)}
        onCountChange={(count) => setFriendRequestCount(count)}
        onAccepted={() => loadFriends()} // updates list after accept
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#25292e", padding: 20 },

  center: { justifyContent: "center", alignItems: "center" },
  loadingText: { color: "white", marginTop: 12 },

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

  emptyText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 30,
  },
});
