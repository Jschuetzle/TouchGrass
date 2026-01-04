// accept-friend-request.dto.ts
import { Expose } from "class-transformer";

export class AcceptFriendRequestDto {
  @Expose()
  requesterUsername!: string;
}
