import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FirebaseAuthModule } from 'src/auth/firebase-auth/firebase-auth.module';
import { RekognitionModule } from 'src/rekognition/rekognition.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    FirebaseAuthModule,
    RekognitionModule,
    S3Module,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}