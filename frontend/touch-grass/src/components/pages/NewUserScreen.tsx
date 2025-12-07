import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { AuthService } from "@/services/auth";
import { CreateUserRequestDto } from "@/common/dto/request/CreateUserDto";
import { UserNamePlaceholder, MaxUserNameLength, AutoCaptialize } from '@/common/constants/validation';
import { useUserContext } from "@/contexts/UserContext";
import { createUser } from "@/api/users";
import { TouchgrassUser } from "@/common/types/user";
import { useRouter } from "expo-router";
import { ApiError } from "@/api/common/api-error";
import { StatusCodes } from "http-status-codes";

export default function NewUserScreen() {
  const { 
    firebaseProviderData,
    setTouchgrassUser
   } = useUserContext();

  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [usernameTaken, setUsernameTaken] = useState(false);

  const router = useRouter();

  // use information from provider data to prefill input fields (i.e. set state)
  useEffect(() => {
    const splitDisplayName = firebaseProviderData.displayName?.split(' ') ?? [""];
    console.log(splitDisplayName);
    if (splitDisplayName.length === 1) {
      setUsername(splitDisplayName[0]);
    }
    else {
      setFirstname(splitDisplayName[0]);
      setLastname(splitDisplayName.slice(1).join(' '));
    }

    setEmail(firebaseProviderData.email ?? "");
    setPhoneNumber(firebaseProviderData.phoneNumber ?? "");
  }, []);


  // function that attempts to create new user on backend
  const onContinue = async () => {
    try {
      const dto = new CreateUserRequestDto({
        username,
        ...(firstname && firstname !== "" && { firstname }),
        ...(lastname && lastname !== "" && { lastname }),
        ...(email && email !== "" && { email }),
        ...(phoneNumber && phoneNumber !== "" && { phoneNumber }),
      });
      
      const response = await createUser(dto);
      const newTouchgrassUser = TouchgrassUser.fromDto(response);
      setTouchgrassUser(newTouchgrassUser);

      router.replace('/(authenticated)/profile-pic-validation');
    } 
    catch (error) {
      if (error instanceof ApiError) {
          if (error.status === StatusCodes.CONFLICT) {
              setUsernameTaken(true);
          }
      } else {
          console.log(`Unexpected error: ${error}`);
      }
    } 
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Welcome to TouchGrass!</Text>
      <Text style={styles.subtitle}>Please confirm or edit your details:</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={(text) => {
            setUsernameTaken(false);
            setUsername(text);
          }}
          placeholder={UserNamePlaceholder}
          placeholderTextColor="rgba(255,255,255,0.3)"
          autoCapitalize={AutoCaptialize}
          maxLength={MaxUserNameLength}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstname}
          onChangeText={setFirstname}
          placeholder="First Name"
          placeholderTextColor="rgba(255,255,255,0.3)"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastname}
          onChangeText={setLastname}
          placeholder="Last Name"
          placeholderTextColor="rgba(255,255,255,0.3)"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="rgba(255,255,255,0.3)"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="+15555555555"
          keyboardType="phone-pad"
          placeholderTextColor="rgba(255,255,255,0.3)"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title="Continue" 
          onPress={onContinue} 
        />
      </View>

      <View style={styles.signOutContainer}>
        <Button 
          title="Sign Out" 
          onPress={() => AuthService.signOut()} 
          color="red" 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#25292e",
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 16,
    textAlign: "center",
  },
  field: {
    width: "100%",
    marginBottom: 12,
  },
  label: {
    color: "#aaa",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  buttonContainer: {
    marginTop: 24,
    width: "100%",
  },
  signOutContainer: {
    marginTop: 12,
    width: "100%",
  },
});
