import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { USER_ENTITY_CONSTANTS } from '../../../common/constants/user';

export class CreateUserRequestDto {
  
  @ApiProperty({
    example: 'abhi_b',
    description: 'Username (3–20 characters)',
    maxLength: USER_ENTITY_CONSTANTS.USERNAME_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_ENTITY_CONSTANTS.USERNAME_MAX_LENGTH)
  username: string;


  @ApiProperty({
    example: 'Abhi',
    required: false,
    description: 'First name',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_ENTITY_CONSTANTS.FIRSTNAME_MAX_LENGTH)
  firstname?: string;


  @ApiProperty({
    example: 'Bangaru',
    required: false,
    description: 'Last name',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_ENTITY_CONSTANTS.LASTNAME_MAX_LENGTH)
  lastname?: string;


  @ApiProperty({
    example: 'abhi@example.com',
    required: false,
    description: 'Email address',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(USER_ENTITY_CONSTANTS.EMAIL_MAX_LENGTH)
  email?: string;


  @ApiProperty({
    example: '+15555555555',
    required: false,
    description: 'Phone number (E.164 format)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(USER_ENTITY_CONSTANTS.PHONE_NUMBER_MAX_LENGTH)
  // @Matches(/^\+?[1-9]\d{1,14}$/, {
  //   message: 'Phone number must be in E.164 format',
  // })
  phone_number?: string;
}