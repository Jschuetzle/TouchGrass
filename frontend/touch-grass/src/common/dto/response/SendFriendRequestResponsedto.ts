import { Expose, Type } from "class-transformer";

export class SendFriendRequestResponseDto {
  @Expose()
  following_id!: string;

  @Expose()
  followed_id!: string;

  @Expose()
  @Type(() => Date)
  requested_at!: Date;

  @Expose()
  is_pending!: boolean;

  @Expose()
  @Type(() => Date)
  accepted_at!: Date | null;
}
