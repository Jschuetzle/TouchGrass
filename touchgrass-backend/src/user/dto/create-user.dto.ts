import {
  IsString,
  IsOptional,
  IsEmail,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'abhi_b',
    description: 'Username (3–20 characters)',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @Length(3, 20)
  username: string;

  @ApiProperty({
    example: 'Abhi',
    required: false,
    description: 'First name',
  })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiProperty({
    example: 'Bangaru',
    required: false,
    description: 'Last name',
  })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiProperty({
    example: 'abhi@example.com',
    required: false,
    description: 'Email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'supersecurepassword123',
    description: 'Password (min 6 characters)',
  })
  @IsString()
  @Length(6)
  password: string;

  @ApiProperty({
    example: 'https://example.com/pfp.jpg',
    required: false,
    description: 'Profile picture URL',
  })
  @IsOptional()
  @IsString()
  profile_pic?: string;

  @ApiProperty({
    example: '+15555555555',
    required: false,
    description: 'Phone number (E.164 format)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  phone_number?: string;
}