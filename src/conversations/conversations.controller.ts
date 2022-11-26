import {
  Post,
  Controller,
  UseGuards,
  Inject,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { userInfo } from 'os';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { IUsersService } from 'src/users/user';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { brotliDecompressSync } from 'zlib';
import { IConversationsService } from './conversations';
import { CreateConversationDto } from './dtos/CreateConversation.dto';

@Controller(Routes.CONVERSATIONS)
@UseGuards(AuthenticatedGuard)
export class ConversationsController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createConversation(
    @AuthUser() user: User,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const newConversation = await this.conversationsService.createConversation(
      user,
      createConversationDto,
    );
    this.eventEmitter.emit('conversation.created', newConversation);
    return newConversation;
  }

  @Get()
  async getConversations(@AuthUser() { id }: User) {
    return this.conversationsService.getConversations(id);
  }

  @Get(':id')
  async getConversationById(@Param('id') id: number) {
    const conversation = await this.conversationsService.findConversationById(
      id,
    );
    return conversation;
  }
}
