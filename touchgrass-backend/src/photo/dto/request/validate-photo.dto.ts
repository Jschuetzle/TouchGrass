import { Expose, Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsArray, IsString } from "class-validator";
import { DEFAULT_DAILY_UPLOAD_COUNT } from "src/common/constants/user";

export class ValidatePhotoDto {
    @Expose()
    @IsString()
    id: string;

    @Expose()
    @IsString()
    object_key: string;
}

export class ValidatePhotosDto {
    @Expose()
    @Type(() => ValidatePhotoDto)
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @ArrayMaxSize(DEFAULT_DAILY_UPLOAD_COUNT)
    photos: ValidatePhotoDto[];
}