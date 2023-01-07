import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  Patch,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { CreateMessageDto } from 'src/messages/dtos/CreateMessage.dto';
import { EmptyMessageException } from 'src/messages/exceptions/EmptyMessage';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import {
  Attachment,
  CreateGroupMessageParams,
  DeleteGroupMessageParams,
  EditGroupMessageParams,
} from 'src/utils/types';
import { EditGroupMessageDto } from '../dtos/EditGroupMessage.dto';
import { IGroupMessagesService } from '../interfaces/group-messages';

@Controller(Routes.GROUP_MESSAGES)
@UseGuards(AuthenticatedGuard)
export class GroupMessagesController {
  constructor(
    @Inject(Services.GROUP_MESSAGES)
    private readonly groupMessagesService: IGroupMessagesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @Throttle(5, 10)
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'attachments',
        maxCount: 5,
      },
    ]),
  )
  async createGroupMessage(
    @AuthUser() user: User,
    @UploadedFiles() { attachments }: { attachments: Attachment[] },
    @Param('id', ParseIntPipe) groupId: number,
    @Body() { content }: CreateMessageDto,
  ) {
    if (!attachments && !content) throw new EmptyMessageException();
    const params: CreateGroupMessageParams = {
      author: user,
      groupId,
      content,
      attachments,
    };
    const response = await this.groupMessagesService.createGroupMessage(params);
    this.eventEmitter.emit('group.message.created', response);

    return response;
  }

  @Get()
  @SkipThrottle()
  async getGroupMessages(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) groupId: number,
  ) {
    const params = {
      userId: user.id,
      groupId,
    };
    const messages = await this.groupMessagesService.getGroupMessages(params);
    return {
      id: groupId,
      messages,
    };
  }

  @Delete(':messageId')
  @SkipThrottle()
  async deleteGroupMessage(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) groupId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    const params: DeleteGroupMessageParams = {
      userId: user.id,
      groupId,
      messageId,
    };
    await this.groupMessagesService.deleteGroupMessage(params);

    this.eventEmitter.emit('group.message.deleted', {
      userId: user.id,
      messageId,
      groupId,
    });

    return { groupId, messageId };
  }

  @Patch(':messageId')
  @SkipThrottle()
  async updateGroupMessage(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) groupId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() editMessageDto: EditGroupMessageDto,
  ) {
    const params: EditGroupMessageParams = {
      userId,
      groupId,
      messageId,
      ...editMessageDto,
    };
    const groupMessage = await this.groupMessagesService.editGroupMessage(
      params,
    );
    this.eventEmitter.emit('group.message.updated', groupMessage);
    return groupMessage;
  }
}
