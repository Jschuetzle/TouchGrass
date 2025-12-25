import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { USER_ENTITY_CONSTANTS } from "../../common/constants/entity";

export class SendFriendRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_ENTITY_CONSTANTS.USERNAME_MAX_LENGTH)
  sentToUsername: string;
}