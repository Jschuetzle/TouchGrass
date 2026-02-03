import { Expose } from "class-transformer";

export class AcceptFriendRequestResponseDto {
  @Expose()
  following_username!: string;

  @Expose()
  followed_username!: string;

  @Expose()
  requested_at!: string;

  @Expose()
  is_pending!: boolean;

  @Expose()
  accepted_at!: string | null;
}
