import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { USER_ENTITY_CONSTANTS } from "../../common/constants/user";

// AcceptFriendRequestDto
// DeclineFriendRequestDto 
// RemoveFriendDto
//  SendFriendRequestDto
export class FriendServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_ENTITY_CONSTANTS.USERNAME_MAX_LENGTH)
  username: string;
}