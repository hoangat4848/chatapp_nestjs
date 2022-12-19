import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { IFriendsService } from './friends';

@Controller(Routes.FRIENDS)
@UseGuards(AuthenticatedGuard)
export class FriendsController {
  constructor(
    @Inject(Services.FRIENDS) private readonly friendsService: IFriendsService,
  ) {}

  @Get()
  getFriends(@AuthUser() user: User) {
    return this.friendsService.getFriends(user.id);
  }
}
