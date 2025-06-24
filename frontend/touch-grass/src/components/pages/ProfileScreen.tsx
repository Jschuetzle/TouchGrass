import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext'; 
import { signOutUser } from '../../services/auth';
import { Image } from 'expo-image';

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/default.webp')} style={{ width: 100, height: 100 }}  />

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text selectable style={styles.json}>
          {JSON.stringify(user, null, 2)}
        </Text>
      </ScrollView>

      <Button title="Sign Out" onPress={signOutUser} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    paddingTop: 60,
    paddingHorizontal: 16,
    gap: 20,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  json: {
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 14,
  },
});
