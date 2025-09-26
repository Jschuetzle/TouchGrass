import NewUserScreen from "@/components/pages/NewUserScreen";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserContext } from "@/contexts/UserContext";
import { useRouter } from "expo-router";

export default function NewUserBasicInfoPage() {
    return <NewUserScreen  />;
}