import { BASE_URL } from "@/common/constants/api";
import { PhotoUploadIntentDto } from "@/common/dto/request/PhotoUploadIntentDto";
import { PhotoUploadIntentResultsDto } from "@/common/dto/response/PhotoUploadIntentResultDto";
import { secureFetch } from "@/services/api";
import { plainToInstance } from "class-transformer";

export async function postUploadIntents(
    intents: PhotoUploadIntentDto[],
    is_profile_pic: boolean = false,
): Promise<PhotoUploadIntentResultsDto> {
  const response = await secureFetch(`${BASE_URL}/photos/intent`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        is_profile_pic,
        intents,
    }),
  });

  if (!response?.ok) {
    const errorText = await response?.text();
    console.error('Failed to upload profile photo. Response:', errorText);
  }
  else {
    const json = await response.json();
    return plainToInstance(PhotoUploadIntentResultsDto, json, { excludeExtraneousValues: true });
  }
}