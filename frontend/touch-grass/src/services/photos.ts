import * as ImagePicker from "expo-image-picker";
import { PhotoUploadIntentResultDto, PhotoUploadIntentResultsDto } from "@/common/dto/response/PhotoUploadIntentResultDto";
import { PhotoUploadIntentDto } from "@/common/dto/request/PhotoUploadIntentDto";
import { ImageAssetWithId } from "@/common/types/photo";
import { plainToInstance } from "class-transformer";
import { postUploadIntents } from "@/api/photos";

export async function pickImageFromLibrary(options: ImagePicker.ImagePickerOptions): Promise<ImageAssetWithId> {
  const result = await pickImagesFromLibrary(options);
  return result.length > 0 ? result[0] : undefined;
}

export async function pickImagesFromLibrary(options: ImagePicker.ImagePickerOptions): Promise<ImageAssetWithId[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    ...options
  });

  return result.canceled ? [] : result.assets!.map(pickerAsset => {
    return {
      uri: pickerAsset.uri,
      asset: {
        id: crypto.randomUUID(),
        content_type: pickerAsset.mimeType,
        size: pickerAsset.fileSize,
      },
    };
  });
}

export async function uploadProfilePhoto(photo: ImageAssetWithId): Promise<PhotoUploadIntentResultDto> {
  const batchResponse = await uploadPhotos([photo], true);
  return batchResponse.intent_results[0];
}

export async function uploadPhotos(imageList: ImageAssetWithId[], isProfilePic: boolean = false): Promise<PhotoUploadIntentResultsDto> {
  // construct the DTO containing metadata of every photo attempting to be uploaded
  const uploadIntentsList: PhotoUploadIntentDto[] = [];
  for (const image of imageList) {
    uploadIntentsList.push(plainToInstance(PhotoUploadIntentDto, image.asset));
  }

  // api call
  const uploadIntentsResponse = await postUploadIntents(uploadIntentsList, isProfilePic);
  const uploadIntentResults = uploadIntentsResponse.intent_results;

  // would need error handling here if http 400 is returned

  // upload photos to s3 with presigned URLs
  for (let i=0; i<uploadIntentResults.length; i++) {
    if (uploadIntentResults[i].success) {
      try {
        uploadPhotoWithPresignedUrl(uploadIntentResults[i]!.presigned_url, imageList[i]);
      } catch {
        console.log(`[ERROR]: Could not upload photo ${imageList[i].asset.id} to S3\n`);
      }
    }
  }

  return uploadIntentsResponse;

  // obviously, this function shouldn't return an IntentResultDto, rather we'd like a DTO containing a validated profile pic
  // the next PR will address this by adding code in this area. The code will
  //    (1) upload the images to presigned_urls returned in the IntentResultsDto
  //    (2) make a second call to the backend to validate these photos
}


async function uploadPhotoWithPresignedUrl(presignedUrl: string, photo: ImageAssetWithId): Promise<void> {
  const file = await fetch(photo.uri);
  const blob = await file.blob();
  
  await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      ...(photo.asset.content_type ? {'Content-Type': photo.asset.content_type} : {}),
      ...(photo.asset.size ? {'Content-Length': String(photo.asset.size)} : {}),
    },
    body: blob,
  });
}

