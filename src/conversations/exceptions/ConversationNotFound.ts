import { HttpException, HttpStatus } from '@nestjs/common';

export class ConversationNotFoundException extends HttpException {
  constructor() {
    super('Conversation Not Found', HttpStatus.NOT_FOUND);
  }
}
