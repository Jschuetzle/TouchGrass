export type UserResponseDto = {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  created_at: Date;
  daily_upload_count: number;
  profile_pic_link: string;
  phone_number: string;
  completed_new_user_flow: boolean;
};
