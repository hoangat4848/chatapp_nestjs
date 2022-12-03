import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { CreateGroupParams, FetchGroupParams } from 'src/utils/types';
import { CreateGroupDto } from './dtos/CreateGroup.dto';
import { IGroupsService } from './groups';

@UseGuards(AuthenticatedGuard)
@Controller(Routes.GROUPS)
export class GroupsController {
  constructor(
    @Inject(Services.GROUPS)
    private readonly groupsService: IGroupsService,
  ) {}

  @Post()
  async createGroup(@AuthUser() user: User, @Body() payload: CreateGroupDto) {
    const params: CreateGroupParams = {
      creator: user,
      ...payload,
    };

    const group = this.groupsService.createGroup(params);
    return group;
  }

  @Get()
  async getGroups(@AuthUser() user: User) {
    const params: FetchGroupParams = {
      userId: user.id,
    };
    return this.groupsService.getGroups(params);
  }
}
