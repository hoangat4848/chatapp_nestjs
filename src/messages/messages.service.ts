import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { userInfo } from 'os';
import { Conversation, Message } from 'src/utils/typeorm';
import { CreateMessageParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IMessagesService } from './messages';

@Injectable()
export class MessagesService implements IMessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async createMessage(params: CreateMessageParams): Promise<Message> {
    const { user, conversationId, content } = params;
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['creator', 'recipient'],
    });
    if (!conversation)
      throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

    if (
      conversation.creator.id !== user.id &&
      conversation.recipient.id !== user.id
    ) {
      throw new HttpException(
        'Cannot create message in this conversation',
        HttpStatus.FORBIDDEN,
      );
    }

    const newMessage = await this.messageRepository.create({
      content,
      conversation,
      author: user,
    });

    const savedMessage = await this.messageRepository.save(newMessage);
    return savedMessage;
  }
}
