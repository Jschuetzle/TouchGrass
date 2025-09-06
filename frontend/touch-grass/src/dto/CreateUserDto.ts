// DTO for creating a user in the backend. Optional fields are marked with '?'.
export type CreateUserDto = {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  profile_pic?: string;
  phone_number?: string; // E.164 string if present, e.g. "+15551234567"
};
