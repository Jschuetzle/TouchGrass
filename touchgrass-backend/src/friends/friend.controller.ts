import {
  Controller,
  Post,
  Body,
  Delete,
  Get,
  Query,
  Param,
  ParseIntPipe,
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
} from '@nestjs/swagger';

@ApiTags('friends')
@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('request')
  @ApiOperation({ summary: 'Send a friend request' })
  @ApiResponse({ status: 201, description: 'Friend request sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input or request already exists' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  sendRequest(@Body() dto: SendRequestDto) {
    return this.friendService.sendFriendRequest(dto.fromId, dto.toId);
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept a friend request' })
  @ApiResponse({ status: 200, description: 'Friend request accepted' })
  @ApiBadRequestResponse({ description: 'Invalid input or no request found' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  acceptRequest(@Body() dto: AcceptRequestDto) {
    return this.friendService.acceptFriendRequest(
      dto.currentUserId,
      dto.requesterId,
    );
  }

  @Post('decline')
  @ApiOperation({ summary: 'Decline a friend request' })
  @ApiResponse({ status: 200, description: 'Friend request declined' })
  @ApiBadRequestResponse({ description: 'Invalid input or no request found' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  declineRequest(@Body() dto: DeclineRequestDto) {
    return this.friendService.declineFriendRequest(
      dto.currentUserId,
      dto.requesterId,
    );
  }

  @Delete()
  @ApiOperation({ summary: 'Remove a friend' })
  @ApiResponse({ status: 200, description: 'Friend removed successfully' })
  @ApiBadRequestResponse({ description: 'Invalid user IDs or users not friends' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  removeFriend(@Body() dto: RemoveFriendDto) {
    return this.friendService.removeFriend(dto.userId1, dto.userId2);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get friends for a user (with optional search/pagination)' })
  @ApiResponse({ status: 200, description: 'List of friends returned' })
  @ApiBadRequestResponse({ description: 'Invalid parameters' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
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

  @Get('requests/:userId')
  @ApiOperation({ summary: 'Get all friend requests for a user' })
  @ApiResponse({ status: 200, description: 'List of friend requests returned' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected server error' })
  @ApiParam({ name: 'userId', description: 'ID of the user receiving requests' })
  getRequests(@Param('userId', ParseIntPipe) userId: string) {
    return this.friendService.getFriendRequests(userId);
  }
}