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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import {
  Attachment,
  CreateGroupParams,
  FetchGroupParams,
  TransferGroupOwnerParams,
  UpdateGroupDetailsParams,
} from 'src/utils/types';
import { CreateGroupDto } from '../dtos/CreateGroup.dto';
import { TransferOwnerDto } from '../dtos/TransferGroupOwner.dto';
import { UpdateGroupDetailsDto } from '../dtos/UpdateGroupDetails.dto';
import { IGroupsService } from '../interfaces/groups';

@SkipThrottle()
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

  @Patch(':id/owner')
  async updateGroupOwner(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) groupId: number,
    @Body() { newOwnerId }: TransferOwnerDto,
  ) {
    const params: TransferGroupOwnerParams = {
      userId: user.id,
      groupId,
      newOwnerId,
    };
    const updatedGroup = await this.groupsService.transferGroupOwner(params);

    this.eventEmitter.emit('group.owner.updated', updatedGroup);
    return updatedGroup;
  }

  @Patch(':id/details')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateGroupDetails(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) groupId: number,
    @UploadedFile() avatar: Attachment,
    @Body() { title }: UpdateGroupDetailsDto,
  ) {
    const params: UpdateGroupDetailsParams = {
      userId: user.id,
      groupId,
      title,
      avatar,
    };
    const updatedGroup = await this.groupsService.updateDetails(params);
    this.eventEmitter.emit('group.details.updated', updatedGroup);
    return updatedGroup;
  }
}
