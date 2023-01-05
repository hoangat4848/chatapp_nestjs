import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageStorageModule } from 'src/image-storage/image-storage.module';
import { Services } from 'src/utils/constants';
import { MessageAttachment } from 'src/utils/typeorm/entities/MessageAttachment';
import { MessageAttachmentsService } from './message-attachments.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageAttachment]), ImageStorageModule],
  providers: [
    {
      provide: Services.MESSAGE_ATTACHMENTS,
      useClass: MessageAttachmentsService,
    },
  ],
  exports: [
    {
      provide: Services.MESSAGE_ATTACHMENTS,
      useClass: MessageAttachmentsService,
    },
  ],
})
export class MessageAttachmentsModule {}
