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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import {
  Attachment,
  CreateMessageParams,
  DeleteMessageParams,
  EditMessageParams,
} from 'src/utils/types';
import { CreateMessageDto } from './dtos/CreateMessage.dto';
import { EditMessageDto } from './dtos/EditMessage.dto';
import { EmptyMessageException } from './exceptions/EmptyMessage';
import { IMessagesService } from './messages';

@Controller(Routes.MESSAGES)
@UseGuards(AuthenticatedGuard)
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messagesService: IMessagesService,
    private eventEmitter: EventEmitter2,
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
  async createMessage(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) conversationId: number,
    @UploadedFiles() files: { attachments: Attachment[] },
    @Body() { content }: CreateMessageDto,
  ) {
    if (!content && !files?.attachments) throw new EmptyMessageException();

    const params: CreateMessageParams = {
      user,
      conversationId,
      content,
      attachments: files?.attachments ?? undefined,
    };
    const response = await this.messagesService.createMessage(params);
    this.eventEmitter.emit('message.created', response);
    return response.message;
  }

  @Get()
  @SkipThrottle()
  async getMessagesFromConversation(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) conversationId: number,
  ) {
    const messages = await this.messagesService.getMessagesByConversationId(
      conversationId,
    );
    return {
      id: conversationId,
      messages,
    };
  }

  @Delete(':messageId')
  async deleteMessageFromConversation(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) conversationId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    const params: DeleteMessageParams = {
      userId: user.id,
      conversationId,
      messageId,
    };
    await this.messagesService.deleteMessage(params);
    this.eventEmitter.emit('message.deleted', {
      userId: user.id,
      messageId,
      conversationId,
    });
    return { conversationId, messageId };
  }

  @Patch(':messageId')
  async updateMessageFromConversation(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) conversationId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() editMessageDto: EditMessageDto,
  ) {
    const params: EditMessageParams = {
      userId,
      conversationId,
      messageId,
      ...editMessageDto,
    };
    const message = await this.messagesService.editMessage(params);
    this.eventEmitter.emit('message.updated', message);
    return message;
  }
}
