import { ApiProperty } from '@nestjs/swagger';
import { FriendDto } from './friend.dto';
import { Expose , Type } from 'class-transformer'

export class GetFriendListDto {
  @ApiProperty({ example: 23 })
  @Expose()
  total: number;

  @ApiProperty({ example: 1 })
  @Expose()
  page: number;

  @ApiProperty({ example: 10 })
  @Expose()
  limit: number;

  @ApiProperty({ type: [FriendDto] })
  @Expose()
  @Type(() => FriendDto)
  results: FriendDto[];
}