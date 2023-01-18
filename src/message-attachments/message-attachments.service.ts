import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { extname } from 'path';
import { IImageStorageService } from 'src/image-storage/image-storage';
import { Services } from 'src/utils/constants';
import { generateUUIDV4 } from 'src/utils/helpers';
import { GroupMessageAttachment } from 'src/utils/typeorm';
import { MessageAttachment } from 'src/utils/typeorm/entities/MessageAttachment';
import { Attachment } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IMessageAttachmentsService } from './message-attachments';

@Injectable()
export class MessageAttachmentsService implements IMessageAttachmentsService {
  constructor(
    @InjectRepository(MessageAttachment)
    private readonly messageAttachmentsRepository: Repository<MessageAttachment>,
    @InjectRepository(GroupMessageAttachment)
    private readonly groupMessageAttachmentsRepository: Repository<GroupMessageAttachment>,
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
        .then(async (newAttachment) => {
          await this.imageStorageService.saveImage(uniqueKey, attachment);
          return newAttachment;
        });
    });

    return Promise.all(promises);
  }

  async createGroupAttachments(
    attachments: Attachment[],
  ): Promise<GroupMessageAttachment[]> {
    const promises = attachments.map((attachment) => {
      const uniqueKey = generateUUIDV4();
      return this.imageStorageService
        .uploadImageCloudinary(attachment, uniqueKey)
        .then((url) =>
          this.groupMessageAttachmentsRepository.create({
            key: url,
          }),
        );
    });

    return Promise.all(promises);
  }

  async deleteAllAttachments(attachments: MessageAttachment[]) {
    const promises = attachments.map((attachment) =>
      this.messageAttachmentsRepository.delete(attachment.id),
    );

    return Promise.all(promises);
  }
}
