import { Expose, Type } from "class-transformer";

export class PhotoUploadIntentResultDto {
    @Expose()
    id: string;

    @Expose()
    success: boolean;

    @Expose()
    object_key?: string;

    @Expose()
    presigned_url?: string;

    @Expose()
    error?: string;
}

export class PhotoUploadIntentResultsDto {
    @Expose()
    @Type(() => PhotoUploadIntentResultDto)
    intent_results: PhotoUploadIntentResultDto[];
}