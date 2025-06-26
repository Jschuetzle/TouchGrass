import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons'; // or any icon library

export default function ProfilePhoto() {
  return (
    <View style={styles.wrapper}>
      <Image source={require('../../assets/default.webp')} style={styles.profilePicture} />
      <TouchableOpacity style={styles.plusButton} onPress={() => console.log('Add clicked')}>
        <Ionicons name="add-circle" size={32} color="dodgerblue" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 150,
    height: 150,
    position: 'relative',
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  plusButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
});
