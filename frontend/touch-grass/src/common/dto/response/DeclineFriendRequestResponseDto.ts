// common/dto/response/DeclineFriendRequestResponseDto.ts
import { Expose } from "class-transformer";

export class DeclineFriendRequestResponseDto {
  @Expose()
  success!: boolean;
}
