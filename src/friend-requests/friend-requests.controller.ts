import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import {
  AcceptFriendRequestParams,
  CancelFriendRequestParams,
  CreateFriendRequestParams,
} from 'src/utils/types';
import { CreateFriendRequestDto } from './dtos/CreateFriendRequest.dto';
import { IFriendRequestsService } from './friend-requests';

@Controller(Routes.FRIEND_REQUESTS)
@UseGuards(AuthenticatedGuard)
export class FriendRequestsController {
  constructor(
    @Inject(Services.FRIEND_REQUESTS)
    private readonly friendRequestsService: IFriendRequestsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createFriendRequest(
    @AuthUser() user: User,
    @Body() { email }: CreateFriendRequestDto,
  ) {
    const params: CreateFriendRequestParams = {
      user,
      email,
    };
    const newFriendRequest = await this.friendRequestsService.create(params);
    this.eventEmitter.emit('friend.request.created', newFriendRequest);
    return newFriendRequest;
  }

  @Patch(':id/accept')
  acceptFriendRequest(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const params: AcceptFriendRequestParams = {
      id,
      userId: user.id,
    };
    return this.friendRequestsService.accept(params);
  }

  @Get()
  getFriendRequests(@AuthUser() user: User) {
    return this.friendRequestsService.getFriendRequests(user.id);
  }

  @Delete(':id/cancel')
  cancelFriendRequest(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const params: CancelFriendRequestParams = {
      id,
      userId,
    };
    return this.friendRequestsService.cancel(params);
  }

  @Patch(':id/reject')
  rejectFriendRequest(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const params = {
      id,
      userId,
    };

    return this.friendRequestsService.reject(params);
  }
}
