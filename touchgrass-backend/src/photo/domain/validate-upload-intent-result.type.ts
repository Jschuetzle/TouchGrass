import { PhotoUploadIntentResultDto } from "../dto/response/photo-upload-intent-result.dto"

export type ValidateUploadIntentResult = {
    results: PhotoUploadIntentResultDto[];
    successCount: number;
};