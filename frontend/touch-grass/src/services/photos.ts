import * as ImagePicker from "expo-image-picker";
import { uploadProfilePic } from '@/api/users';
import { UploadProfilePhotoResponseDto } from "@/common/dto/response/UploadProfilePhotoResponseDto";

const photoUploadEndpoints = {
  "profile-pic": uploadProfilePic
} as const;

type UploadEndpoint = keyof typeof photoUploadEndpoints;

export async function pickImages(
  options: ImagePicker.ImagePickerOptions
): Promise<string[] | undefined> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    ...options
  });

  if (!result.canceled) {
    // go through all images and return URIs
    return result.assets!.map(pickerAsset => pickerAsset.uri)
  }
}

export async function uploadPhotos(
  uriList: string[],
  destination: UploadEndpoint
): Promise<UploadProfilePhotoResponseDto> {
  const form = new FormData();

  for (const uri of uriList) {
    const res = await fetch(uri);
    const blob = await res.blob();

    form.append('photos', blob);
  }

  const uploadFn = photoUploadEndpoints[destination];
  return await uploadFn(form);
}

