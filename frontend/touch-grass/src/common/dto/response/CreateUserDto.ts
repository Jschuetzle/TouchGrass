import { Type } from 'class-transformer';

export class CreateUserResponseDto {
  username: string;
  firstname?: string;
  lastname?: string;
  email?: string;

  @Type(() => Date)
  created_at: Date;

  daily_upload_count: number;
  phone_number?: string;
  completed_new_user_flow: boolean;
};
