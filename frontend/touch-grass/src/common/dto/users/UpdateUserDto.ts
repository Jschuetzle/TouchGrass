import { CreateUserDto } from "@/common/dto/users/CreateUserDto";

// DTO for partially updating a user.
// Same as CreateUserDto but all fields optional.
export type UpdateUserDto = Partial<CreateUserDto>;
