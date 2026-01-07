import { Expose, Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ValidatePhotoResultDto {
    @Expose()
    @IsString()
    id: string;

    @Expose()
    @IsBoolean()
    success: boolean;

    @Expose()
    @IsOptional()
    @IsString()
    error?: string;
}

export class ValidatePhotoResultsDto {
    @Expose()
    @Type(() => ValidatePhotoResultDto)
    results: ValidatePhotoResultDto[];
}