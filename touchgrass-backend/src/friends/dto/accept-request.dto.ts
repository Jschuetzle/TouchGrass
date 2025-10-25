import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { USER_CONSTANTS } from "../../common/constants";

export class AcceptFriendRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_CONSTANTS.USERNAME_MAX_LENGTH)
  requesterUsername: string;
}