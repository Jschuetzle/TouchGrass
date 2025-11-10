import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadProfilePhotoResponseDto {
  constructor(init?: Partial<UploadProfilePhotoResponseDto>) {
    Object.assign(this, init);
  }
  
  @ApiProperty({
    required: true,
    description: 'States whether the submitted profile photo was validated',
  })
  @IsBoolean()
  success: boolean;
  

  @ApiProperty({
    example: 'https://<bucket-name>.s3.<region>.amazonaws.com/<key>',
    required: false,
    description: 'If success is true, then this contains the S3 link to the profile photo. Otherwise, property is not included in response.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  profile_photo_link?: string;


  @ApiProperty({
    example: 'Sunglasses covering facial features in submitted photo',
    required: false,
    description: 'If success is true, then this message informs the user why validation failed. Otherwise, property is not included in response.'
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  err_msg?: string;
}