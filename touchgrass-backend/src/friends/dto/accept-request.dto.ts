import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { USER_ENTITY_CONSTANTS } from "../../common/constants/user";

export class AcceptFriendRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_ENTITY_CONSTANTS.USERNAME_MAX_LENGTH)
  requesterUsername: string;
}