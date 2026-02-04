import { Expose } from "class-transformer";

export class AcceptFriendRequestResponseDto {
  @Expose()
  requested_at!: string;

  @Expose()
  is_pending!: boolean;

  @Expose()
  accepted_at!: string | null;
}
