import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { extname } from 'path';
import { IImageStorageService } from 'src/image-storage/image-storage';
import { Services } from 'src/utils/constants';
import { generateUUIDV4 } from 'src/utils/helpers';
import { MessageAttachment } from 'src/utils/typeorm/entities/MessageAttachment';
import { Attachment } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IMessageAttachmentsService } from './message-attachments';

@Injectable()
export class MessageAttachmentsService implements IMessageAttachmentsService {
  constructor(
    @InjectRepository(MessageAttachment)
    private readonly messageAttachmentsRepository: Repository<MessageAttachment>,
    @Inject(Services.IMAGE_STORAGE)
    private readonly imageStorageService: IImageStorageService,
  ) {}

  async create(attachments: Attachment[]): Promise<MessageAttachment[]> {
    const promises = attachments.map((attachment) => {
      const uniqueKey = generateUUIDV4();
      const newAttachment = this.messageAttachmentsRepository.create({
        key: uniqueKey + extname(attachment.originalname),
      });
      return this.messageAttachmentsRepository
        .save(newAttachment)
        .then((newAttachment) => {
          this.imageStorageService.saveImage(uniqueKey, attachment);
          return newAttachment;
        });
    });

    return Promise.all(promises);
  }
}
