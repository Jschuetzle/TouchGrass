import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { USER_CONSTANTS } from "../../common/constants";

export class RemoveFriendDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_CONSTANTS.USERNAME_MAX_LENGTH)
  removedUsername: string;
}