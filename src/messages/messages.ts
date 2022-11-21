import { Message } from 'src/utils/typeorm';
import { CreateMessageParams } from 'src/utils/types';

export interface IMessagesService {
  createMessage(params: CreateMessageParams): Promise<Message>;
}
