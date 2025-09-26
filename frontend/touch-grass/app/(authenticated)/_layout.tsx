import { getDashboard } from "@/api/dashboard";
import { DashboardStatus } from "@/common/constants/api";
import { DashboardResponseDto } from "@/common/dto/dashboard/DashboardResponseDto";
import { UserProvider } from "@/contexts/UserContext";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function AuthenticatedLayout() {
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
          router.replace("/(authenticated)/new-user-basic-info");
        }
        else if (!dashboardResponse.data.completed_new_user_flow) {
          router.replace("/(authenticated)/profile-pic-validation");
        }
        else {
          router.replace("/(authenticated)/(tabs)");
        }
      }
    }, [dashboardResponse]);

  
    if (dashboardLoading) {
      return (
          <ActivityIndicator size="large" />
      );
    }
    else if (!dashboardResponse) {
      // error in obtaining the response
      // we'd put some error handling in here...just not sure right now the correct way to handle
      console.error('GET /dashboard failed');
      return <ActivityIndicator size="large" />;
    }
    else {
      return (
        <UserProvider>
          <Stack screenOptions={{ headerShown: false }}/>
        </UserProvider>
      )
    }
}