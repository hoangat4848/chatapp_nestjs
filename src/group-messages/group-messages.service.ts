import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { IGroupsService } from 'src/groups/groups';
import { Services } from 'src/utils/constants';
import { Group, GroupMessage } from 'src/utils/typeorm';
import {
  CreateGroupMessageParams,
  DeleteGroupMessageParams,
  GetGroupMessagesParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { IGroupMessagesService } from './group-messages';

@Injectable()
export class GroupMessagesService implements IGroupMessagesService {
  constructor(
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @Inject(Services.GROUPS)
    private readonly groupService: IGroupsService,
  ) {}

  async createGroupMessage(params: CreateGroupMessageParams) {
    const { groupId, author, content } = params;

    const group = await this.groupService.findGroupById(groupId);
    if (!group)
      throw new HttpException('No Group Found', HttpStatus.BAD_REQUEST);
    const findUser = group.users.find((user) => user.id === author.id);
    if (!findUser)
      throw new HttpException('User Not In Group', HttpStatus.BAD_REQUEST);

    const newGroupMessage = await this.groupMessageRepository.create({
      author: instanceToPlain(author),
      content,
      group,
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
      throw new HttpException('No Group Found', HttpStatus.BAD_REQUEST);
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
        author: true,
      },
      select: {
        author: {
          id: true,
          firstName: true,
          lastName: true,
        },
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

    const message = await this.groupMessageRepository.findOne({
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
    if (!message)
      throw new HttpException('Cannot delete message', HttpStatus.BAD_REQUEST);

    if (group.lastMessageSent.id === message.id) {
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

    await this.groupMessageRepository.delete({ id: message.id });
  }
}
