import { ApiProperty } from '@nestjs/swagger';
import { FriendDto } from './friend.dto';

export class GetFriendListDto {
  @ApiProperty({ example: 23 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ type: [FriendDto] })
  results: FriendDto[];
}
