import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext'; 
import { signOutUser } from '../../services/auth';
import GroupRowList from '../groups/GroupRowList';
import ProfilePhoto from '../profile/ProfilePhoto';

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
  <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.centeredRow}>
      <ProfilePhoto />
    </View>

    <View style={styles.centeredRow}>
      <Text style={styles.title}>{user.email}</Text>
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

    <View style={styles.buttonWrapper}>
      <Button title="Sign Out" color="red" onPress={signOutUser} />
    </View>
  </ScrollView>

    
  );
}


const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 16,
    gap: 20, // adds vertical spacing between children (React Native 0.71+)
    backgroundColor: 'white',
    flexGrow: 1,
  },
  centeredRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
  },
  secondary: {
    fontSize: 16,
    color: 'blue',
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 150,
  },
  groupListWrapper: {
    marginVertical: 16, // space above and below group list
  },
  buttonWrapper: {
    marginTop: 32, // space above Sign Out button
    alignItems: 'center',
  },
});
