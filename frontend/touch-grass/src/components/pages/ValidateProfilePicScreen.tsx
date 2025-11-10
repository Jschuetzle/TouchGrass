import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  Button,
  Modal,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as StringConstants from '@/common/constants/strings';
import { updateUser } from "@/api/users";
import { useUserContext } from "@/contexts/UserContext";
import { useRouter } from "expo-router";
import { pickImages, uploadPhotos } from "@/services/photos";
import { UpdateCompletedNewUserFlowRequestDto } from "@/common/dto/request/UpdateCompletedNewUserFlowDto";

export default function ValidateProfilePicScreen() {
  const { touchgrassUser, setTouchgrassUser } = useUserContext();

  const [avatarUri, setAvatarUri] = useState("");
  const [showVerifySkipModal, setShowVerifySkipModal] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isUpdatingCompletedFlag, setIsUpdatingCompletedFlag] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorMessageVisible, setIsErrorMessageVisible] = useState(false);

  const router = useRouter();

  const onSkip = async () => {
    setIsUpdatingCompletedFlag(true);

    try {
      const dto = new UpdateCompletedNewUserFlowRequestDto(true)
      const response = await updateUser(dto);
      
      if (response.success) {
        setTouchgrassUser({
          ...touchgrassUser,
          completed_new_user_flow: response.completed_new_user_flow,
        });

        router.replace("/(authenticated)/(tabs)");
      }
    } 
    catch (error) {
      console.log(`Error on PATCH /users for completed_new_user_flow`);
    } 
    finally {
      setIsUpdatingCompletedFlag(false);
    }
  };

  const pickImage = async () => {
    setIsPickingImage(true);
    const picked = await pickImages({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      selectionLimit: 1
    });

    if (picked) {
      setAvatarUri(picked[0]);
    }

    setIsPickingImage(false);
  };

  const handleValidate = async () => {
    if (avatarUri) {
      onValidate();
    }
    else {
      Alert.alert("Need to upload profile photo for validation");
    }
  }

  const onValidate = async () => {
    setErrorMessage("");
    setIsErrorMessageVisible(false);
    setIsValidating(true);

    const response = await uploadPhotos([avatarUri], "profile-pic");

    // setTouchgrassUser with updated profile pic link...
    if (response.success) {
      setTouchgrassUser({
        ...touchgrassUser,
        profile_pic_link: response.profile_photo_link,
      });

      router.replace('/(authenticated)/(tabs)');
    } 
    else {
      setErrorMessage(response.err_msg);
      setIsErrorMessageVisible(true);
    }

    Alert.alert("Success", "Profile photo uploaded!");
    setIsValidating(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <BlurView style={StyleSheet.absoluteFill} intensity={100}>
        <Modal
          animationType="slide"
          transparent
          visible={showVerifySkipModal}
          onRequestClose={() => {
            setShowVerifySkipModal(!showVerifySkipModal);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Are you completely sure?</Text>
              <Text style={styles.modalText}>
                Not providing a profile photo will mean there's no way for us to
                send you photos you’re in!
              </Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setShowVerifySkipModal(false)}
              >
                <Text style={styles.textStyle}>
                  Ok, I'll setup my profile pic
                </Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={onSkip}
              >
                <Text style={styles.textStyle}>I AM SURE.</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </BlurView>

      <View style={styles.container}>
        <Text style={styles.title}>
          {StringConstants.VALIDATE_PROFILE_PIC_SCREEN_TITLE}
        </Text>

        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <MaterialCommunityIcons name="account" size={72} />
            )}
          </View>

          <View style={styles.keyBadge}>
            <MaterialCommunityIcons name="key" size={22} color="#ffbf00" />
          </View>
        </View>

        { isErrorMessageVisible && <Text>{errorMessage}</Text> }

        <Pressable
          onPress={pickImage}
          style={({ pressed }) => [
            styles.uploadBtn,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          disabled={isValidating}
        >
          <Text style={styles.uploadText}>
            {avatarUri ? "Change photo" : "Upload"}
          </Text>
          <Ionicons name="cloud-upload-outline" size={20} />
        </Pressable>

        <Pressable
          onPress={handleValidate}
          style={({ pressed }) => [
            styles.ctaBtn,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          disabled={isValidating}
        >
          <Text style={styles.ctaText}>
            {isValidating ? "Validating..." : "Validate"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setShowVerifySkipModal(true)}
          style={({ pressed }) => [
            styles.ctaBtn,
            pressed && { transform: [{ translateY: 1 }] },
          ]}
          disabled={isValidating}
        >
          <Text style={styles.ctaText}>Skip this for now</Text>
        </Pressable>

        <View style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  );
}

const BLUE = "#74B3FF";
const CARD = "#ffffff";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BLUE },
  container: {
    flex: 1,
    backgroundColor: BLUE,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  title: {
    alignSelf: "flex-start",
    fontSize: 22,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 6,
    marginBottom: 24,
  },

  avatarWrap: {
    marginTop: 8,
    marginBottom: 26,
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    ...shadow(10),
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  keyBadge: {
    position: "absolute",
    right: 10,
    bottom: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    ...shadow(8),
  },

  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 22,
    height: 48,
    borderRadius: 10,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    ...shadow(6),
  },
  uploadText: {
    fontSize: 16,
    color: "#1c1c1c",
  },

  ctaBtn: {
    marginTop: 22,
    height: 48,
    paddingHorizontal: 28,
    borderRadius: 24,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    ...shadow(4),
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1c1c1c",
  },
  signOutWrapper: {
    marginTop: 32,
    alignItems: "center",
    width: "100%",
  },
  blurContainer: {
    flex: 1,
    padding: 20,
    margin: 16,
    textAlign: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "75%",
    height: "75%",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

function shadow(elev: number) {
  return Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: elev / 2,
      shadowOffset: { width: 0, height: Math.ceil(elev / 2) },
    },
    android: { elevation: elev },
    default: {},
  }) as any;
}
