import { Expose, Type } from "class-transformer";

export class ValidatePhotoDto {
    @Expose()
    id: string;

    @Expose()
    object_key: string;
}

export class ValidatePhotosDto {
    @Expose()
    @Type(() => ValidatePhotoDto)
    photos: ValidatePhotoDto[];
}