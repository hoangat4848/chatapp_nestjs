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
import { DeleteMessageParams, EditMessageParams } from 'src/utils/types';
import { CreateMessageDto } from './dtos/CreateMessage.dto';
import { EditMessageDto } from './dtos/EditMessage.dto';
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
  async createMessage(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) conversationId: number,
    @Body() { content }: CreateMessageDto,
  ) {
    const params = { user, conversationId, content };
    const response = await this.messagesService.createMessage(params);
    this.eventEmitter.emit('message.created', response);
    return response.message;
  }

  @Get()
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
