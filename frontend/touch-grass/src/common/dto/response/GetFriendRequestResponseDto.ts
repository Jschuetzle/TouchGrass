// common/dto/response/GetFriendRequestResponseDto.ts
import { Expose } from "class-transformer";

export class GetFriendRequestResponseDto {
  @Expose()
  id!: string;

  @Expose()
  username!: string;

  @Expose()
  firstname!: string | null;

  @Expose()
  lastname!: string | null;

  @Expose()
  email!: string;

  @Expose()
  phone_number!: string | null;

  @Expose()
  created_at!: string;

  @Expose()
  daily_upload_count!: number;

  @Expose()
  profile_pic_link!: string | null;

  @Expose()
  completed_new_user_flow!: boolean;
}
