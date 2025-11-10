import 'reflect-metadata';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import DashboardScreen from '@/components/pages/DashboardScreen';
import { useEffect, useState } from 'react';
import { getDashboard } from '@/api/dashboard';
import { DashboardResponseDto } from '@/common/dto/response/DashboardResponseDto';
import { DashboardStatus } from '@/common/constants/api';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const [dashboardResponse, setDashboardResponse] = useState<DashboardResponseDto | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);

  const router = useRouter();
  
  // the call to GET /dashboard checks if this is a new user
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await getDashboard();
        setDashboardResponse(response);

        // set things properly in the auth context
      } finally {
        setDashboardLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  // utilizes response from above to determine if new user is present
  useEffect(() => {
    if (dashboardResponse) {
      if(dashboardResponse.status === DashboardStatus.NEW_USER) {
        router.replace("/new-user-basic-info");
      }
      else if (!dashboardResponse.data.completed_new_user_flow) {
        router.replace("profile-pic-validation");
      }
      else {
        router.replace("/");
      }
    }
  }, [dashboardResponse]);
  

  if (dashboardLoading) {
    return <ActivityIndicator size="large" />
  }
  else if (!dashboardResponse) {
    // error in obtaining the response
    // we'd put some error handling in here...just not sure right now the correct way to handle
    console.error('GET /dashboard failed');
    return <ActivityIndicator size="large" />;
  }
  else {
    return (
      <View style={styles.container}>
        <DashboardScreen />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});