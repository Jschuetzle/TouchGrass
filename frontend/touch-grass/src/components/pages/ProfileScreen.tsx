import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import ProfilePhoto from "../profile/ProfilePhoto";
import GroupRowList from "../groups/GroupRowList";
import { useUserContext } from "@/contexts/UserContext";
import { Ionicons } from "@expo/vector-icons"; // if you're using Expo
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { firebaseUser } = useUserContext();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header with settings button */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={() =>
            router.push("/(authenticated)/(tabs)/profile/settings")
          }
        >
          <Ionicons name="settings-outline" size={26} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.centeredRow}>
          <ProfilePhoto />
        </View>

        <View style={styles.centeredRow}>
          <Text style={styles.title}>{firebaseUser.email}</Text>
        </View>

        <View style={styles.centeredRow}>
          <Text style={styles.secondary}>Albums to Review: 0</Text>
        </View>

        <View style={styles.centeredRow}>
          <Text style={styles.secondary}>Groups:</Text>
        </View>

        <View style={styles.groupListWrapper}>
          <GroupRowList />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  container: {
    paddingTop: 20,
    paddingHorizontal: 16,
    gap: 20,
    flexGrow: 1,
  },
  centeredRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    color: "black",
    textAlign: "center",
  },
  secondary: {
    fontSize: 16,
    color: "blue",
  },
  groupListWrapper: {
    marginVertical: 16,
  },
  buttonWrapper: {
    marginTop: 32,
    alignItems: "center",
  },
  settingsOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "white",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
});
