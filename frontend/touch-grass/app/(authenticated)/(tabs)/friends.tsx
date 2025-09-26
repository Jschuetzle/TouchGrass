import { Text, View, StyleSheet } from 'react-native';
import DashBoardScreen from '../../../src/components/pages/DashboardScreen';

export default function FriendsScreen() {
  return (
    <View style={styles.container}>
      <DashBoardScreen />
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