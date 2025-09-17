import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from './user.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';
import { FirebaseUser } from '../auth/firebase-user/firebase-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}


  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    description: 'Payload to create a user',
    type: CreateUserDto,
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
  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }


  @ApiOperation({ summary: 'Update fields of a user without updating the whole user' })
  @ApiBody({
    description: 'Fields of the user to udpate',
    type: UpdateUserDto,
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
  @Patch(':uid')
  async parialUpdate(
    @Param('uid') uid: string,
    @Body() body: UpdateUserDto,
  ) {
    return await this.userService.updateUser(uid, body);
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
