// common/dto/request/DeclineFriendRequestDto.ts
import { Expose } from "class-transformer";

export class DeclineFriendRequestRequestDto {
  @Expose()
  requesterUsername!: string;
}
