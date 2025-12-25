import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Patch,
  Put,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserRequestDto } from './dto/request/create-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from './domain/user.entity';
import { FirebaseAuthGuard } from '../firebase/auth/firebase-auth.guard';
import { FirebaseUser } from '../firebase/auth/firebase-user.decorator';
import { UpdateCompletedNewUserFlowRequestDto } from './dto/request/update-completed-new-user-workflow.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { CreateUserResponseDto } from './dto/response/create-user.dto';
import { DecodedIdToken } from 'firebase-admin/auth';
import { FileInterceptor } from '@nestjs/platform-express';
import { REKOGNITION_MAX_FILE_SIZE_BYTES } from '../common/constants/rekognition';
import { UpdateCompletedNewUserFlowResponseDto } from './dto/response/update-completed-new-user-workflow.dto';
import { UploadProfilePhotoResponseDto } from './dto/response/upload-profile-photo.dto';
import { TransformEntityInterceptor } from '../common/interceptors/transform-entity.interceptor';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}


  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    description: 'Payload to create a user',
    type: CreateUserRequestDto,
    examples: {
      example1: {
        summary: 'Basic user creation payload',
        value: {
          id: 'user_abc123',
          username: 'abhi_b',
          firstname: 'Abhi',
          lastname: 'Bangaru',
          email: 'abhi@example.com',
          profile_pic: 'https://cdn.example.com/pfp.jpg',
          phone_number: '+15555555555',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Validation failed or duplicate user' })
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(new TransformEntityInterceptor(CreateUserResponseDto))
  @Post()
  async create(@Body() body: CreateUserRequestDto, @FirebaseUser() firebaseUser: DecodedIdToken): Promise<CreateUserResponseDto> {
    return await this.userService.create(firebaseUser.uid, body);
  }


  @ApiOperation({ summary: 'Update fields of a user without updating the whole user' })
  @ApiBody({
    description: 'Fields of the user to udpate',
    type: UpdateCompletedNewUserFlowRequestDto,
    examples: {
      example1: {
        summary: 'Patch user payload',
        value: {
          firstname: 'Abhimanyu',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully updated',
    type: User,
  })
  @UseGuards(FirebaseAuthGuard)
  @Patch()
  async update(@Body() body: UpdateCompletedNewUserFlowRequestDto, @FirebaseUser() firebaseUser: DecodedIdToken): Promise<Partial<CreateUserResponseDto>> {
    const updatedUserEntity = await this.userService.updateUser(firebaseUser.uid, body as User);
    
    // conversion of entity to dto
    const plain = instanceToPlain(updatedUserEntity, { exposeUnsetFields: false });
    return plainToInstance(UpdateCompletedNewUserFlowResponseDto, plain, { excludeExtraneousValues: true })
  }


  @ApiOperation({ summary: 'Validate a user-selected profile picure' })
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('photos'))
  @Put('profile-pic')
  async updateProfilePhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: REKOGNITION_MAX_FILE_SIZE_BYTES })
        ]
      })
    ) 
    photo: Express.Multer.File,
    @FirebaseUser() firebaseUser: DecodedIdToken
  ): Promise<UploadProfilePhotoResponseDto> {
    return await this.userService.validateProfilePhoto(firebaseUser.uid, photo);
  }


  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search users by username (requires Firebase Auth)' })
  @ApiQuery({ name: 'query', required: true, description: 'Search term (username)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of users to return per page', example: 10 })
  @ApiResponse({ status: 200, description: 'List of users matching the query', type: [User] })
  @ApiBadRequestResponse({ description: 'Search query must be a non-empty string' })
  @UseGuards(FirebaseAuthGuard)
  @Get('search')
  async searchUsers(
    @Query('query') username: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @FirebaseUser() user: any,
  ) {
    return await this.userService.searchUsers(username, page, limit);
  }
}
