import { Expose, Type } from "class-transformer";
import { FriendDto } from "@/common/dto/response/FriendDto";

export class GetFriendsResponseDto {
  @Expose()
  total!: number;

  @Expose()
  page!: number;

  @Expose()
  limit!: number;

  @Expose()
  @Type(() => FriendDto)
  results!: FriendDto[];
}
