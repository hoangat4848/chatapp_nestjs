import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { IMessageAttachmentsService } from 'src/message-attachments/message-attachments';
import { Services } from 'src/utils/constants';
import { Group, GroupMessage } from 'src/utils/typeorm';
import {
  CreateGroupMessageParams,
  DeleteGroupMessageParams,
  EditGroupMessageParams,
  GetGroupMessagesParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { IGroupMessagesService } from '../interfaces/group-messages';
import { IGroupsService } from '../interfaces/groups';

@Injectable()
export class GroupMessagesService implements IGroupMessagesService {
  constructor(
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @Inject(Services.GROUPS)
    private readonly groupService: IGroupsService,
    @Inject(Services.MESSAGE_ATTACHMENTS)
    private readonly messageAttachmentsService: IMessageAttachmentsService,
  ) {}

  async createGroupMessage(params: CreateGroupMessageParams) {
    const { groupId, author, content, attachments } = params;

    const group = await this.groupService.findGroupById(groupId);
    if (!group)
      throw new HttpException('Group Not Found', HttpStatus.BAD_REQUEST);
    const findUser = group.users.find((user) => user.id === author.id);
    if (!findUser)
      throw new HttpException('User Not In Group', HttpStatus.BAD_REQUEST);

    const newGroupMessage = await this.groupMessageRepository.create({
      author: instanceToPlain(author),
      content,
      group,
      attachments: attachments
        ? await this.messageAttachmentsService.createGroupAttachments(
            attachments,
          )
        : [],
    });
    const savedMessage = await this.groupMessageRepository.save(
      newGroupMessage,
    );

    group.lastMessageSent = savedMessage;
    // group.lastMessageSentAt = savedMessage.createdAt;
    const updatedGroup = await this.groupService.saveGroup(group);

    return { message: savedMessage, group: updatedGroup };
  }

  async getGroupMessages(
    params: GetGroupMessagesParams,
  ): Promise<GroupMessage[]> {
    const { userId, groupId } = params;
    const group = await this.groupService.findGroupById(groupId);
    if (!group)
      throw new HttpException('Group Not Found', HttpStatus.BAD_REQUEST);
    const userIndex = group.users.findIndex((user) => user.id === userId);
    if (userIndex < 0)
      throw new HttpException('User Not In Group', HttpStatus.BAD_REQUEST);

    return this.groupMessageRepository.find({
      where: {
        group: { id: group.id },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        author: {
          profile: true,
        },
        attachments: true,
      },
    });
  }

  async deleteGroupMessage(params: DeleteGroupMessageParams) {
    const { userId, groupId, messageId } = params;

    const group = await this.groupRepository
      .createQueryBuilder('group')
      .where('group.id = :groupId', { groupId })
      .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('group.messages', 'messages')
      .orderBy('messages.createdAt', 'DESC')
      .limit(5)
      .getOne();
    if (!group)
      throw new HttpException('Group not found', HttpStatus.BAD_REQUEST);

    const groupMessage = await this.groupMessageRepository.findOne({
      where: {
        id: messageId,
        author: {
          id: userId,
        },
        group: {
          id: groupId,
        },
      },
    });
    if (!groupMessage)
      throw new HttpException('Cannot delete message', HttpStatus.BAD_REQUEST);

    if (group.lastMessageSent.id === groupMessage.id) {
      const SECOND_MESSAGE_INDEX = 1;
      if (group.messages.length <= 1) {
        await this.groupRepository.update(
          { id: groupId },
          {
            lastMessageSent: null,
            lastMessageSentAt: null,
          },
        );
      } else {
        const newLastMessage = group.messages[SECOND_MESSAGE_INDEX];

        await this.groupRepository.update(
          { id: groupId },
          {
            lastMessageSent: newLastMessage,
            lastMessageSentAt: newLastMessage.createdAt,
          },
        );
      }
    }

    await this.groupMessageRepository.delete({ id: groupMessage.id });
  }

  async editGroupMessage(
    params: EditGroupMessageParams,
  ): Promise<GroupMessage> {
    const { userId, groupId, messageId, content } = params;
    const group = await this.groupService.findGroupById(groupId);
    if (!group)
      throw new HttpException('Group Not Found', HttpStatus.BAD_REQUEST);

    const groupMessage = await this.groupMessageRepository.findOne({
      where: {
        id: messageId,
        author: { id: userId },
        group: { id: groupId },
      },
      relations: {
        group: {
          users: true,
        },
        author: true,
      },
    });
    if (!groupMessage)
      throw new HttpException('Cannot update message', HttpStatus.BAD_REQUEST);

    groupMessage.content = content;
    const updatedGroupMessage = this.groupMessageRepository.save(groupMessage);
    return updatedGroupMessage;
  }
}
