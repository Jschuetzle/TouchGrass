import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'abhi123',
    description: 'Unique username between 3 and 20 characters',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @Length(3, 20)
  username: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL to the user’s profile picture',
  })
  @IsString()
  profile_pic: string;
}