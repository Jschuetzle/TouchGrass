import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FirebaseAuthModule } from '../firebase/auth/firebase-auth.module';
import { RekognitionModule } from 'src/rekognition/rekognition.module';
import { S3Module } from 'src/s3/s3.module';
import { UserRepositoryImpl } from './infrastructure/user-repository.impl';
import { USER_REPOSITORY_TOKEN } from 'src/common/constants/provider-tokens';

@Module({
  imports: [
    TypeOrmModule.fFirebaseAuthModuleorFeature([User]), 
    ,
    RekognitionModule,
    S3Module,
  ],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY_TOKEN, useClass: UserRepositoryImpl,
    },
  ],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}