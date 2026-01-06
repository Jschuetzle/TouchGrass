import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer'

export class FriendDto {
  @ApiProperty({ example: 'user123' })
  @Expose()
  username: string;

  @ApiProperty({ example: 'https://cdn.example.com/avatar.png', required: false })
  @Expose()
  avatarUrl?: string;
}