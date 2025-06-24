import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext'; 
import { signOutUser } from '../../services/auth';
import { Image } from 'expo-image';

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.centeredRow}>
        <Image source={require('../../assets/default.webp')} style={styles.profilePicture}  />
      </View>
      <View style={styles.centeredRow}>
        <Text style={styles.title}>{user.email}</Text>  
      </View>
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
  profilePicture: {
    width:150,
    height:150,
    borderRadius:150
  },
  centeredRow:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
  
});
