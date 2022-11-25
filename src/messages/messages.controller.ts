import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { CreateMessageDto } from './dtos/CreateMessage.dto';
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
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const params = { user, ...createMessageDto };
    const newMessage = await this.messagesService.createMessage(params);
    this.eventEmitter.emit('message.created', newMessage);
    return;
  }

  @Get(':conversationId')
  async getMessageFromConversation(
    @AuthUser() user: User,
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    const messages = await this.messagesService.getMessagesByConversationId(
      conversationId,
    );
    return {
      id: conversationId,
      messages,
    };
  }
}
