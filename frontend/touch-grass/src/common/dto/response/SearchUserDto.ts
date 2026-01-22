import { Expose } from "class-transformer";

export class SearchUserDto {
  @Expose()
  username!: string;

  @Expose()
  avatarUrl?: string;
}
