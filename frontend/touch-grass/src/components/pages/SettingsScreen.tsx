import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Button } from "react-native";
import { AuthService } from "../../services/auth";

export default function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Button
          title="Sign Out"
          color="red"
          onPress={() => AuthService.signOut()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#444",
  },
});
