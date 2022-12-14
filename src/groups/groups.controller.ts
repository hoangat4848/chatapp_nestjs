import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { CreateMessageDto } from 'src/messages/dtos/CreateMessage.dto';
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createGroup(@AuthUser() user: User, @Body() payload: CreateGroupDto) {
    const params: CreateGroupParams = {
      creator: user,
      ...payload,
    };

    const group = await this.groupsService.createGroup(params);
    this.eventEmitter.emit('group.created', group);
    return group;
  }

  @Get()
  async getGroups(@AuthUser() user: User) {
    const params: FetchGroupParams = {
      userId: user.id,
    };
    return this.groupsService.getGroups(params);
  }

  @Get(':id')
  getGroup(@AuthUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findGroupById(id);
  }
}
