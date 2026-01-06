import { View, StyleSheet, ActivityIndicator } from 'react-native';
import DashboardScreen from '@/components/pages/DashboardScreen';
import { useEffect, useState } from 'react';
import { getDashboard } from '@/api/dashboard';
import { DashboardResponseDto } from '@/common/dto/response/DashboardResponseDto';
import { DashboardStatus } from '@/common/constants/api';
import { useRouter } from 'expo-router';
import { useUserContext } from '@/contexts/UserContext';
import { TouchgrassUser } from '@/common/types/user';

export default function Dashboard() {
  const { touchgrassUser, setTouchgrassUser } = useUserContext();

  const [dashboardResponse, setDashboardResponse] = useState<DashboardResponseDto | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);

  const router = useRouter();
  
  // the call to GET /dashboard checks if this is a new user
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await getDashboard();
        setDashboardResponse(response);
      } finally {
        setDashboardLoading(false);
      }
    }

    // In the future, if the touchgrassUser is already loaded (e.g. the user just completed the new user flow)
    // then communicate to the dashboard endpoint that no user entity is needed
    fetchDashboard();
  }, []);

  // utilizes response from above to determine if new user is present
  useEffect(() => {
    if (dashboardResponse) {
      if(dashboardResponse.status === DashboardStatus.NEW_USER) {
        router.replace("/new-user-basic-info");
      }
      else if (dashboardResponse.status === DashboardStatus.EXISTING_USER) {
        const userResponseDto = dashboardResponse.data;
        const touchgrassUser = TouchgrassUser.fromDto(userResponseDto);
        setTouchgrassUser(touchgrassUser);

        if (!dashboardResponse.data.completed_new_user_flow) {
          router.replace("profile-pic-validation");
        }
        else {
          router.replace("/");
        }
      }
      else {
        // This would only occur in the case the backend isn't working properly
        // would obviously need more robust error handling
        console.log(`[ERROR]: Received unknown status ${dashboardResponse.status} from GET /dashboard`);
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