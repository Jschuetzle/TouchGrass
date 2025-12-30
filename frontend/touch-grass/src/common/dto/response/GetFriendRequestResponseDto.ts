// common/dto/response/GetFriendRequestResponseDto.ts
export type GetFriendRequestResponseDto = {
  id: string;
  username: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  phone_number: string | null;
  created_at: string;
  daily_upload_count: number;
  profile_pic_link: string | null;
  completed_new_user_flow: boolean;
};

