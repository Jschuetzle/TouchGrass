export type CreateUserDto = {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone_number?: string; // E.164
  completed_new_user_flow?: boolean;
};
