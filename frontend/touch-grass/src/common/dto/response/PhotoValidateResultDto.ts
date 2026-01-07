import { Expose, Type } from "class-transformer";

export class ValidatePhotoResultDto {
    @Expose()
    id: string;

    @Expose()
    success: boolean;

    @Expose()
    error?: string;
}

export class ValidatePhotoResultsDto {
    @Expose()
    @Type(() => ValidatePhotoResultDto)
    results: ValidatePhotoResultDto[];
}