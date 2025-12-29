import { Expose, Type } from "class-transformer";
import { IsBoolean, IsString, IsUrl, ValidateIf } from "class-validator";

export class PhotoUploadIntentResultDto {
    @Expose()
    @IsString()
    id: string;

    @Expose()
    @IsBoolean()
    success: boolean;

    @Expose()
    @ValidateIf(o => o.success)
    @IsString()
    object_key?: string;

    @Expose()
    @ValidateIf(o => o.success)
    @IsString()
    @IsUrl()
    presigned_url?: string;

    @Expose()
    @ValidateIf(o => !o.success)
    @IsString()
    error?: string;
}

export class PhotoUploadIntentResultsDto {
    @Expose()
    @Type(() => PhotoUploadIntentResultDto)
    intent_results: PhotoUploadIntentResultDto[];
}