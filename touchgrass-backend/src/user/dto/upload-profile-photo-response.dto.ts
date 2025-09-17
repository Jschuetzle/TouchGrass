import {
  IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadProfilePhotoResponseDto {
    @ApiProperty({
        example: 'https://<bucket-name>.s3.<region>.amazonaws.com/<key>',
        required: true,
        description: 'S3 link to profile photo',
    })
    @IsString()
    profile_photo_link: string;
}