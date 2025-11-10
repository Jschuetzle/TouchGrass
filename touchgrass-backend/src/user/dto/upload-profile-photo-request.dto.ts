import {
  IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadProfilePhotoRequestDto {
    @ApiProperty({
        example: 'SGVsbG8gV29ybGQ=',
        required: true,
        description: 'Base64 encoded profile photo',
    })
    @IsString()
    profile_photo: string;
}