import { ApiProperty } from '@nestjs/swagger';

export class FriendDto {
  @ApiProperty({ example: 'user123' })
  username: string;

  @ApiProperty({
    example: 'https://cdn.example.com/avatar.png',
    required: false,
  })
  avatarUrl?: string;
}
