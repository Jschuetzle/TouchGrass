import { Expose } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { USER_ENTITY_CONSTANTS } from "../../common/constants/user";
import { IsNotUndefined } from "../../common/decorators/class-validator";

/**
 * A subset of the User entity. Contains properties which we allow updates for in the PATCH endpoint
 */
export class PatchUserDto {
    @Expose()
    @IsString()
    @IsNotEmpty()
    @MaxLength(USER_ENTITY_CONSTANTS.USERNAME_MAX_LENGTH)
    username: string;
    
    @Expose()
    @IsNotUndefined()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(USER_ENTITY_CONSTANTS.FIRSTNAME_MAX_LENGTH)
    firstname: string;

    @Expose()
    @IsNotUndefined()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(USER_ENTITY_CONSTANTS.LASTNAME_MAX_LENGTH)
    lastname: string;

    @Expose()
    @IsNotUndefined()
    @IsOptional()
    @IsEmail()
    @MaxLength(USER_ENTITY_CONSTANTS.EMAIL_MAX_LENGTH)
    email: string;

    @Expose()
    @IsNotUndefined()
    @IsOptional()
    @IsString()
    @MaxLength(USER_ENTITY_CONSTANTS.PHONE_NUMBER_MAX_LENGTH)
    phone_number: string;

    @Expose()
    @IsBoolean()
    completed_new_user_flow: boolean;
}