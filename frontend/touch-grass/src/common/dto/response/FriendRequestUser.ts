import { Expose } from "class-transformer";

export class FriendRequestUser {
  @Expose()
  id!: string;

  @Expose()
  username!: string;
}
