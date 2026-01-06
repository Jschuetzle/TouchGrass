import { Expose } from "class-transformer";

export class FriendDto {
  @Expose()
  username!: string;

  @Expose()
  avatarUrl?: string;
}
