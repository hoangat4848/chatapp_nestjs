import { Controller, Delete, Inject, Post, UseGuards } from '@nestjs/common';
import {
  Body,
  Param,
} from '@nestjs/common/decorators/http/route-params.decorator';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import {
  AddGroupRecipientParams,
  RemoveGroupRecipientParams,
} from 'src/utils/types';
import { AddGroupRecipientDto } from '../dtos/AddGroupRecipient.dto';
import { IGroupRecipientsService } from '../interfaces/group-recipients';

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
    @Body() { email }: AddGroupRecipientDto,
  ) {
    const params: AddGroupRecipientParams = { issuerId, groupId, email };
    const response = await this.groupRecipientsService.addGroupRecipient(
      params,
    );
    this.eventEmitter.emit('group.user.added', response);
    return response;
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
    return this.groupRecipientsService.removeGroupRecipient(params);
  }
}
