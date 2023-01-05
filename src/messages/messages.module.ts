import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageAttachmentsModule } from 'src/message-attachments/message-attachments.module';
import { Services } from 'src/utils/constants';
import { Conversation, Message } from 'src/utils/typeorm';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation]),
    MessageAttachmentsModule,
  ],
  controllers: [MessagesController],
  providers: [
    {
      provide: Services.MESSAGES,
      useClass: MessagesService,
    },
  ],
  exports: [
    {
      provide: Services.MESSAGES,
      useClass: MessagesService,
    },
  ],
})
export class MessagesModule {}
