import { Expose, Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsArray, IsBoolean, IsInt, IsMimeType, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { DEFAULT_DAILY_UPLOAD_COUNT } from "src/common/constants/user";
import { IsImageMimeType } from "src/common/decorators/class-validator";

export class PhotoUploadIntentDto {
    @Expose()
    @IsString()
    id: string;
    
    @Expose()
    @IsOptional()
    @IsString()
    @IsMimeType()
    @IsImageMimeType()
    content_type?: string;

    @Expose()
    @IsOptional()
    @IsInt()
    size: number;
}

export class PhotoUploadIntentsRequestDto {
    @Expose()
    @IsBoolean()
    is_profile_pic: boolean;

    @Expose()
    @Type(() => PhotoUploadIntentDto)
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @ValidateIf(o => o.is_profile_pic)
    @ArrayMinSize(1)
    @ArrayMaxSize(1)

    @ValidateIf(o => !o.is_profile_pic)
    @ArrayMaxSize(DEFAULT_DAILY_UPLOAD_COUNT)
    
    intents: PhotoUploadIntentDto[];
}