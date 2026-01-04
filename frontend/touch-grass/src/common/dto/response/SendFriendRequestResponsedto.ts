import { Expose, Type } from "class-transformer";

export class SendFriendRequestResponseDto {
  @Expose()
  @Type(() => Date)
  requested_at!: Date;

  @Expose()
  is_pending!: boolean;

  @Expose()
  @Type(() => Date)
  accepted_at?: Date;
}
