import * as ImagePicker from "expo-image-picker";
import { PhotoUploadIntentResultDto } from "@/common/dto/response/PhotoUploadIntentResultDto";
import { PhotoUploadIntentDto } from "@/common/dto/request/PhotoUploadIntentDto";
import { CloudStorageUploadResult, ImageAssetWithId, PhotoOperation } from "@/common/types/photo";
import { plainToInstance } from "class-transformer";
import { postUploadIntents, validateUpload } from "@/api/photos";
import { ValidatePhotoDto } from "@/common/dto/request/PhotoValidateDto";
import { ValidatePhotoResultDto, ValidatePhotoResultsDto } from "@/common/dto/response/PhotoValidateResultDto";

export async function pickImageFromLibrary(options: ImagePicker.ImagePickerOptions): Promise<ImageAssetWithId | undefined> {
  const result = await pickImagesFromLibrary({
    allowsMultipleSelection: false,
    ...(options),
  });
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

export async function uploadProfilePhoto(photo: ImageAssetWithId): Promise<ValidatePhotoResultDto> {
  const batchResponse = await uploadPhotos([photo], PhotoOperation.PROFILE_PIC);
  return batchResponse.results[0];
}

export async function uploadPhotos(imageList: ImageAssetWithId[], photoOp: PhotoOperation): Promise<ValidatePhotoResultsDto> {
  // construct the DTO containing metadata of every photo attempting to be uploaded
  const uploadIntentsList = imageList.map((image) => plainToInstance(PhotoUploadIntentDto, image.asset));

  // construct map of (imageId -> imageAsset) for easy handling of photos
  // if backend returns uploads in a different order, then searching a list is slow
  const imageMap = imageList.reduce<Record<string, ImageAssetWithId>>((acc, item) => {
    acc[item.asset.id] = item;
    return acc;
  }, {});


  // api call to POST /photos/intent
  const uploadIntentsResults = (await postUploadIntents(uploadIntentsList, photoOp)).intent_results;

  // upload photos to s3 with presigned URLs
  const successfulIntents = uploadIntentsResults.filter((result) => result.success);
  const unsuccessfulIntents = uploadIntentsResults.filter((result) => !result.success);

  const cloudStorageResult = await uploadPhotosToCloudStorage(successfulIntents, imageMap);

  // construct DTOs for validation endpoint
  // only validate intents that were successfully uploaded to cloud storage
  const validatePhotoDtos = cloudStorageResult.successfulUploads.map((intentResult) => {
    return plainToInstance(
      ValidatePhotoDto, 
      {
        id: intentResult.id,
        object_key: intentResult!.object_key,
      }
    );
  });

  return await validateUpload(validatePhotoDtos);
}


async function uploadPhotosToCloudStorage(
  intentList: PhotoUploadIntentResultDto[], 
  imageMap: Record<string, ImageAssetWithId>,
): Promise<CloudStorageUploadResult> {
  const result = {
    successfulUploads: [],
    unsuccessfulUploads: [],
  };

  for (const intent of intentList) {
    try {
      await uploadPhotoWithPresignedUrl(intent!.presigned_url, imageMap[intent.id]);
      result.successfulUploads.push(intent);
    } catch {
      console.log(`[ERROR]: Could not upload photo ${imageMap[intent.id].asset.id} to cloud storage\n`);
      result.unsuccessfulUploads.push(intent);
    }
  }

  return result;
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

