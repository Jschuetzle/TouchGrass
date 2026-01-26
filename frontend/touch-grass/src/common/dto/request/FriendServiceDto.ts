// accept-friend-request.dto.ts
import { Expose } from "class-transformer";

// AcceptFriendRequestDto 

export class FriendServiceDto {
  @Expose()
  username!: string;
}