import { CreateUserDto } from "./create-user-request.dto";
import { PartialType, OmitType } from '@nestjs/mapped-types';

export class UpdateUserDto extends PartialType(CreateUserDto) {}