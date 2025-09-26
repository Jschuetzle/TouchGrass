import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsEmail, IsNumber, IsOptional, IsString, Length, Matches } from "class-validator";

export class UserResponseDto {
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
    firstname: string;


    @ApiProperty({
        example: 'Bangaru',
        required: false,
        description: 'Last name',
    })
    @IsOptional()
    @IsString()
    lastname: string;


    @ApiProperty({
        example: 'abhi@example.com',
        required: false,
        description: 'Email address',
    })
    @IsOptional()
    @IsEmail()
    email: string;


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
        required: false,
        description: 'If it exists, link to storage location of profile picture.',
    })
    @IsString()
    profile_pic_link: string;


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
    phone_number: string;

    
    @ApiProperty({
        required: false,
        description: 'Flag that describes whether user is done creating their account',
    })
    @IsOptional()
    @IsBoolean()
    completed_new_user_flow: boolean
}