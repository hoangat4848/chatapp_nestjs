import { Post, Controller, UseGuards, Inject, Body } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { brotliDecompressSync } from 'zlib';
import { IConversationsService } from './conversations';
import { CreateConversationDto } from './dtos/CreateConversation.dto';

@Controller(Routes.CONVERSATIONS)
export class ConversationsController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationService: IConversationsService,
  ) {}

  @Post()
  @UseGuards(AuthenticatedGuard)
  createConversation(@Body() createConversationDto: CreateConversationDto) {
    this.conversationService.createConversation(createConversationDto);
  }
}
