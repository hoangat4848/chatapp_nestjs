import { Controller, Delete, Inject, Post, UseGuards } from '@nestjs/common';
import {
  Body,
  Param,
} from '@nestjs/common/decorators/http/route-params.decorator';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import {
  AddGroupRecipientParams,
  LeaveGroupParams,
  RemoveGroupRecipientParams,
} from 'src/utils/types';
import { AddGroupRecipientDto } from '../dtos/AddGroupRecipient.dto';
import { IGroupRecipientsService } from '../interfaces/group-recipients';

@SkipThrottle()
@Controller(Routes.GROUP_RECIPIENTS)
@UseGuards(AuthenticatedGuard)
export class GroupRecipientsController {
  constructor(
    @Inject(Services.GROUP_RECIPIENTS)
    private readonly groupRecipientsService: IGroupRecipientsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async addGroupRecipient(
    @AuthUser() { id: issuerId }: User,
    @Param('id', ParseIntPipe) groupId: number,
    @Body() { username }: AddGroupRecipientDto,
  ) {
    const params: AddGroupRecipientParams = { issuerId, groupId, username };
    const response = await this.groupRecipientsService.addGroupRecipient(
      params,
    );
    this.eventEmitter.emit('group.user.added', response);
    return response;
  }

  /**
   * Leaves a Group
   * @param user the authenticated User
   * @param groupId the id of the group
   * @returns the updated Group that the user had left
   */
  @Delete('/leave')
  async leaveGroup(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) groupId: number,
  ) {
    const params: LeaveGroupParams = {
      userId: user.id,
      groupId,
    };
    const updatedGroup = await this.groupRecipientsService.leaveGroup(params);
    this.eventEmitter.emit('group.user.leave', {
      group: updatedGroup,
      userId: user.id,
    });

    return updatedGroup;
  }

  @Delete(':userId')
  async removeGroupRecipient(
    @AuthUser() { id: issuerId }: User,
    @Param('id', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) removeUserId: number,
  ) {
    const params: RemoveGroupRecipientParams = {
      issuerId,
      groupId,
      removeUserId,
    };

    const response = await this.groupRecipientsService.removeGroupRecipient(
      params,
    );
    this.eventEmitter.emit('group.user.removed', response);

    return response.group;
  }
}
