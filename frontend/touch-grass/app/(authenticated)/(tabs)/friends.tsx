import { View, StyleSheet } from 'react-native';
import AddFriendScreen from '@/components/pages/AddFriendScreen';

export default function FriendsScreen() {
  return (
    <View style={styles.container}>
      <AddFriendScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});