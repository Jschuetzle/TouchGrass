import { Expose } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';

export class SearchUserDto {
  @Expose()
  username!: string;

  @Expose()
  avatarUrl?: string;
}
