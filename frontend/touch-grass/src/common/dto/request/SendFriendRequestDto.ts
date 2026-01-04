import { Expose } from "class-transformer";

export class SendFriendRequestDto {
  @Expose()
  sentToUsername!: string;
}
