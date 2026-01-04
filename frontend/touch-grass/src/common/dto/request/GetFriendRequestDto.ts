import { Expose } from "class-transformer";

export class GetFriendRequestDto {
  @Expose()
  username!: string;
}
