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
import { SendRequestDto } from './dto/send-request.dto';
import { AcceptRequestDto } from './dto/accept-request.dto';
import { DeclineRequestDto } from './dto/decline-request.dto';
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
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';

@ApiTags('friends')
@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('request')
  @ApiOperation({ summary: 'Send a friend request' })
  @ApiBody({
    description: 'SendRequestDto',
    examples: {
      example1: {
        summary: 'Send request from user A to user B',
        value: {
          fromId: 'user123',
          toId: 'user456',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Friend request sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input or request already exists' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  sendRequest(@Body() dto: SendRequestDto) {
    return this.friendService.sendFriendRequest(dto.fromId, dto.toId);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('accept')
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
  acceptRequest(@Body() dto: AcceptRequestDto) {
    return this.friendService.acceptFriendRequest(
      dto.currentUserId,
      dto.requesterId,
    );
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('decline')
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
  declineRequest(@Body() dto: DeclineRequestDto) {
    return this.friendService.declineFriendRequest(
      dto.currentUserId,
      dto.requesterId,
    );
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete()
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
  removeFriend(@Body() dto: RemoveFriendDto) {
    return this.friendService.removeFriend(dto.userId1, dto.userId2);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('list/:userId')
  @ApiOperation({ summary: 'Get friends for a user (with optional search/pagination)' })
  @ApiResponse({ status: 200, description: 'List of friends returned' })
  @ApiBadRequestResponse({ description: 'Invalid parameters' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  @ApiQuery({ name: 'search', required: false, example: 'john' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  getFriends(
    @Param('userId') userId: string,
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.friendService.getFriends(
      userId,
      search || '',
      parseInt(page || '1'),
      parseInt(limit || '10'),
    );
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('requests/:userId')
  @ApiOperation({ summary: 'Get all friend requests for a user' })
  @ApiResponse({ status: 200, description: 'List of friend requests returned' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  @ApiParam({ name: 'userId', description: 'ID of the user receiving requests', example: 'user456' })
  getRequests(@Param('userId') userId: string) {
    return this.friendService.getFriendRequests(userId);
  }
}
