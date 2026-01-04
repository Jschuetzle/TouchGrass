import { Expose } from "class-transformer";

export class AcceptFriendRequestResponseDto {
  @Expose()
  following_id!: string;

  @Expose()
  followed_id!: string;

  @Expose()
  requested_at!: string;

  @Expose()
  is_pending!: boolean;

  @Expose()
  accepted_at!: string | null;
}
