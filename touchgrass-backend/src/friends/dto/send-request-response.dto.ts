import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SendFriendRequestResponseDto {
  @ApiProperty()
  @Expose()
  @Type(() => Date)
  requested_at!: Date;

  @ApiProperty()
  @Expose()
  is_pending!: boolean;

  @ApiProperty({ nullable: true })
  @Expose()
  @Type(() => Date)
  accepted_at?: Date;
}
