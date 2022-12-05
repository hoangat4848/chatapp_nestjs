import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupMessage, Message } from 'src/utils/typeorm';
import { CreateGroupMessageParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IGroupMessagesService } from './group-messages';

@Injectable()
export class GroupMessagesService implements IGroupMessagesService {
  constructor(
    @InjectRepository(GroupMessage)
    private readonly messageRepository: Repository<GroupMessage>,
  ) {}

  // @ts-ignore
  createGroupMessage(params: CreateGroupMessageParams): Promise<Message> {}
}
