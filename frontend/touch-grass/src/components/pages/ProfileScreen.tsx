import { View, Text, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext'; 

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>User JSON:</Text>
      <Text selectable style={{ fontFamily: 'monospace', fontSize: 14 }}>
        {JSON.stringify(user, null, 2)}
      </Text>
    </ScrollView>
  );
}
