import { ApiProperty } from "@nestjs/swagger";
import { 
    IsBoolean, 
    IsDate, 
    IsEmail, 
    IsNotEmpty, 
    IsNumber, 
    IsOptional, 
    IsString, 
    Matches, 
    Max, 
    MaxLength
} from "class-validator";
import { USER_CONSTANTS } from "../../../common/constants";
import { User } from "src/user/user.entity";

export class CreateUserResponseDto {

    @ApiProperty({
        example: 'abhi_b',
        required: true,
        description: 'Username (3–20 characters)',
        minLength: 3,
        maxLength: 20,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(USER_CONSTANTS.USERNAME_MAX_LENGTH)
    username: string;


    @ApiProperty({
        example: 'Abhi',
        required: false,
        description: 'First name',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(USER_CONSTANTS.FIRSTNAME_MAX_LENGTH)
    firstname?: string;


    @ApiProperty({
        example: 'Bangaru',
        required: false,
        description: 'Last name',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(USER_CONSTANTS.LASTNAME_MAX_LENGTH)
    lastname?: string;


    @ApiProperty({
        example: 'abhi@example.com',
        required: false,
        description: 'Email address',
    })
    @IsOptional()
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(USER_CONSTANTS.EMAIL_MAX_LENGTH)
    email?: string;


    @ApiProperty({
        example: '2025-09-22 14:35:12.123',
        required: true,
        description: 'Time account was created at',
    })
    @IsDate()
    created_at: Date;


    @ApiProperty({
        required: true,
        description: 'Number of photos user has uploaded for current day',
    })
    @IsNumber()
    daily_upload_count: number;


    @ApiProperty({
        example: '+15555555555',
        required: false,
        description: 'Phone number (E.164 format)',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(USER_CONSTANTS.PHONE_NUMBER_MAX_LENGTH)
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone number must be in E.164 format',
    })
    phone_number?: string;


    @ApiProperty({
        required: true,
        description: 'Flag that describes whether user is done creating their account',
    })
    @IsBoolean()
    completed_new_user_flow: boolean
}