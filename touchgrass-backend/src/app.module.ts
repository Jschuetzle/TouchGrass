import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { FriendsModule } from './friends/friends.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MulterModule } from '@nestjs/platform-express';
import { PhotosModule } from './photo/photo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true, // true for dev only
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    UserModule,
    FriendsModule,
    DashboardModule,
    PhotosModule,
  ],
})
export class AppModule {}
