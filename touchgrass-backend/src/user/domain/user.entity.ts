import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Follow } from '../../friends/friend.entity';
import { USER_ENTITY_CONSTANTS } from '../../common/constants/user';
import { Exclude, Expose, Transform } from 'class-transformer';
import { USER_PK_CONSTRAINT_NAME, USERNAME_CONSTRAINT_NAME } from '../../common/constants/db-constraints';
import { IsBoolean, IsDate, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsNotUndefined } from '../../common/decorators/class-validator';
import { Photo } from 'src/photo/domain/photo.entity';

@Entity('user')
export class User {
  @PrimaryColumn({ 
    type: 'varchar', 
    length: USER_ENTITY_CONSTANTS.ID_MAX_LENGTH,
    primaryKeyConstraintName: USER_PK_CONSTRAINT_NAME,
  })
  @Exclude()
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_ENTITY_CONSTANTS.ID_MAX_LENGTH)
  id: string;

  @Unique(USERNAME_CONSTRAINT_NAME, ['username'])
  @Column({ length: USER_ENTITY_CONSTANTS.USERNAME_MAX_LENGTH })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_ENTITY_CONSTANTS.USERNAME_MAX_LENGTH)
  username: string;

  @Column({ length: USER_ENTITY_CONSTANTS.FIRSTNAME_MAX_LENGTH, nullable: true })
  @Transform(({ value }) => value ?? undefined, { toPlainOnly: true })
  @Expose()
  @IsNotUndefined()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_ENTITY_CONSTANTS.FIRSTNAME_MAX_LENGTH)
  firstname: string;

  @Column({ length: USER_ENTITY_CONSTANTS.LASTNAME_MAX_LENGTH, nullable: true })
  @Transform(({ value }) => value ?? undefined, { toPlainOnly: true })
  @Expose()
  @IsNotUndefined()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_ENTITY_CONSTANTS.LASTNAME_MAX_LENGTH)
  lastname: string;

  @Column({ length: USER_ENTITY_CONSTANTS.EMAIL_MAX_LENGTH, nullable: true })
  @Transform(({ value }) => value ?? undefined, { toPlainOnly: true })
  @Expose()
  @IsNotUndefined()
  @IsOptional()
  @IsEmail()
  @MaxLength(USER_ENTITY_CONSTANTS.EMAIL_MAX_LENGTH)
  email: string;

  @Column({ length: USER_ENTITY_CONSTANTS.PHONE_NUMBER_MAX_LENGTH, nullable: true })
  @Transform(({ value }) => value ?? undefined, { toPlainOnly: true })
  @Expose()
  @IsNotUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(USER_ENTITY_CONSTANTS.PHONE_NUMBER_MAX_LENGTH)
  // @Matches(/^\+?[1-9]\d{1,14}$/, {
  //   message: 'Phone number must be in E.164 format',
  // })
  // save for later feature
  phone_number: string;

  @CreateDateColumn()
  @Expose()
  @IsDate()
  created_at: Date;

  @Column({ type: 'int', default: 0 })
  @Expose()
  @IsInt()
  daily_upload_count: number;

  @Column({ length: USER_ENTITY_CONSTANTS.PROFILE_PIC_OBJ_KEY_MAX_LENGTH, nullable: true })
  @Transform(({ value }) => value ?? undefined, { toPlainOnly: true })
  @Expose()
  @IsNotUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(USER_ENTITY_CONSTANTS.PROFILE_PIC_OBJ_KEY_MAX_LENGTH)
  profile_pic_obj_key: string;

  @Column({ type: 'boolean', default: false })
  @Expose()
  @IsBoolean()
  completed_new_user_flow: boolean;

  // Relationships for the friend system
  @OneToMany(() => Follow, follow => follow.following)
  @Exclude()
  following: Follow[];

  @OneToMany(() => Follow, follow => follow.followed)
  @Exclude()
  followers: Follow[];

  // Relationships for the photo system
  @OneToMany(() => Photo, photo => photo.owner_id)
  @Exclude()
  photos: Photo[];
}