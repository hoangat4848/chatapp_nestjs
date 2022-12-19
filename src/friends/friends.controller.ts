import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { CreateFriendParams } from 'src/utils/types';
import { CreateFriendDto } from './dtos/CreateFriendRequest.dto';
import { IFriendsService } from './friends';

@Controller(Routes.FRIENDS)
@UseGuards(AuthenticatedGuard)
export class FriendsController {
  constructor(
    @Inject(Services.FRIENDS) private readonly friendsService: IFriendsService,
  ) {}

  @Post()
  createFriend(@AuthUser() user: User, @Body() { email }: CreateFriendDto) {
    const params: CreateFriendParams = { user, email };
    return this.friendsService.createFriendRequest(params);
  }
}
