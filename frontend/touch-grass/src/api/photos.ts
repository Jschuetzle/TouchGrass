import { BASE_URL } from "@/common/constants/api";
import { PhotoUploadIntentDto } from "@/common/dto/request/PhotoUploadIntentDto";
import { ValidatePhotoDto, ValidatePhotosDto } from "@/common/dto/request/PhotoValidateDto";
import { PhotoUploadIntentResultsDto } from "@/common/dto/response/PhotoUploadIntentResultDto";
import { ValidatePhotoResultsDto } from "@/common/dto/response/PhotoValidateResultDto";
import { PhotoOperation } from "@/common/types/photo";
import { secureFetch } from "@/services/api";
import { plainToInstance } from "class-transformer";

export async function postUploadIntents(
    intents: PhotoUploadIntentDto[],
    op: PhotoOperation,
): Promise<PhotoUploadIntentResultsDto> {
  const response = await secureFetch(`${BASE_URL}/photos/intent`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        op,
        intents,
    }),
  });

  if (!response?.ok) {
    const errorText = await response?.text();
    console.error('Failed to POST /photos/intent\n Error Response: ', errorText);
    throw new Error(`${response.status} Failed to POST /photos/intent`);
  }
  else {
    const json = await response.json();
    return plainToInstance(PhotoUploadIntentResultsDto, json, { excludeExtraneousValues: true });
  }
}


export async function validateUpload(photos: ValidatePhotoDto[]): Promise<ValidatePhotoResultsDto> {
  const response = await secureFetch(`${BASE_URL}/photos/validate`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      photos: photos,
    } as ValidatePhotosDto),
  });

  if (!response?.ok) {
    const errorText = await response?.text();
    console.error('Failed to POST /photos/validate\nError Response: ', errorText);
    throw new Error(`${response.status} Failed to POST /photos/validate`);
  }
  else {
    const json = await response.json();
    return plainToInstance(ValidatePhotoResultsDto, json, { excludeExtraneousValues: true });
  }
}