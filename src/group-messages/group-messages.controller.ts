import {
  Body,
  Controller,
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
import { IGroupMessagesService } from './group-messages';

@Controller(Routes.GROUP_MESSAGES)
@UseGuards(AuthenticatedGuard)
export class GroupMessagesController {
  constructor(
    @Inject(Services.GROUP_MESSAGES)
    private readonly groupMessagesService: IGroupMessagesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createGroupMessage(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) groupId: number,
    @Body() createGroupMessageDto: CreateMessageDto,
  ) {
    const params = {
      author: user,
      groupId,
      ...createGroupMessageDto,
    };

    const response = await this.groupMessagesService.createGroupMessage(params);
    this.eventEmitter.emit('group.message.created', response);

    return response;
  }
}
