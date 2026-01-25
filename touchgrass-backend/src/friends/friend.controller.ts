import {
  Controller,
  Post,
  Body,
  Delete,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { SendFriendRequestDto } from './dto/send-request.dto';
import { AcceptFriendRequestDto } from './dto/accept-request.dto';
import { DeclineFriendRequestDto } from './dto/decline-request.dto';
import { RemoveFriendDto } from './dto/remove-friend.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../firebase/auth/firebase-auth.guard';
import { FirebaseUser } from '../firebase/auth/firebase-user.decorator';
import { DecodedIdToken } from 'firebase-admin/auth';
import { SendFriendRequestResponseDto } from './dto/send-request-response.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('friends')
@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @ApiOperation({ summary: 'Send a friend request' })
  @ApiBody({
    description: 'SendFriendRequestDto',
    examples: {
      example1: {
        summary: 'Send request from user A to user B',
        value: {
          sentToUsername: 'user456',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Friend request sent successfully',
    type: SendFriendRequestResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input or request already exists' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  @UseGuards(FirebaseAuthGuard)
  @Post('request')
  async sendRequest(
    @Body() dto: SendFriendRequestDto,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const result = await this.friendService.sendFriendRequest(
      firebaseUser.uid,
      dto.sentToUsername,
    );

    const resultDto = plainToInstance(SendFriendRequestResponseDto, result, {
      excludeExtraneousValues: true,
    });

    return resultDto;
  }


  @ApiOperation({ summary: 'Accept a friend request' })
  @ApiBody({
    description: 'AcceptRequestDto',
    examples: {
      example1: {
        summary: 'User accepts friend request',
        value: {
          currentUserId: 'user456',
          requesterId: 'user123',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Friend request accepted' })
  @ApiBadRequestResponse({ description: 'Invalid input or no request found' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  @UseGuards(FirebaseAuthGuard)
  @Post('accept')
  acceptRequest(@Body() dto: AcceptFriendRequestDto, @FirebaseUser() firebaseUser: DecodedIdToken) {
    return this.friendService.acceptFriendRequest(
      firebaseUser.uid,
      dto.requesterUsername,
    );
  }


  @ApiOperation({ summary: 'Decline a friend request' })
  @ApiBody({
    description: 'DeclineRequestDto',
    examples: {
      example1: {
        summary: 'User declines a request',
        value: {
          currentUserId: 'user456',
          requesterId: 'user123',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Friend request declined' })
  @ApiBadRequestResponse({ description: 'Invalid input or no request found' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  @UseGuards(FirebaseAuthGuard)
  @Post('decline')
  declineRequest(@Body() dto: DeclineFriendRequestDto,  @FirebaseUser() firebaseUser: DecodedIdToken) {
    return this.friendService.declineFriendRequest(
      firebaseUser.uid,
      dto.requesterUsername,
    );
  }


  @ApiOperation({ summary: 'Remove a friend' })
  @ApiBody({
    description: 'RemoveFriendDto',
    examples: {
      example1: {
        summary: 'Remove a friend connection between two users',
        value: {
          userId1: 'user123',
          userId2: 'user456',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Friend removed successfully' })
  @ApiBadRequestResponse({ description: 'Invalid user IDs or users not friends' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  @UseGuards(FirebaseAuthGuard)
  @Delete()
  removeFriend(@Body() dto: RemoveFriendDto, @FirebaseUser() firebaseUser: DecodedIdToken) {
    return this.friendService.removeFriend(firebaseUser.uid, dto.removedUsername);
  }


  @ApiOperation({ summary: 'Get friends for a user (with optional search/pagination)' })
  @ApiResponse({ status: 200, description: 'List of friends returned' })
  @ApiBadRequestResponse({ description: 'Invalid parameters' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  @ApiQuery({ name: 'search', required: false, example: 'john' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  @UseGuards(FirebaseAuthGuard)
  @Get('list')
  async getFriends(
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @FirebaseUser() firebaseUser: DecodedIdToken
  ) {
    return await this.friendService.getFriends(
      firebaseUser.uid,
      search || '',
      parseInt(page || '1'),
      parseInt(limit || '10'),
    );
  }


  @ApiOperation({ summary: 'Get all friend requests for a user' })
  @ApiResponse({ status: 200, description: 'List of friend requests returned' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  @ApiParam({ name: 'userId', description: 'ID of the user receiving requests', example: 'user456' })
  @UseGuards(FirebaseAuthGuard)
  @Get('requests')
  getRequests(@FirebaseUser() firebaseUser: DecodedIdToken) {
    return this.friendService.getFriendRequests(firebaseUser.uid);
  }
}
