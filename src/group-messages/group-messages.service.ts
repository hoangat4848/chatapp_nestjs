import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { IGroupsService } from 'src/groups/groups';
import { Services } from 'src/utils/constants';
import { GroupMessage } from 'src/utils/typeorm';
import { CreateGroupMessageParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IGroupMessagesService } from './group-messages';

@Injectable()
export class GroupMessagesService implements IGroupMessagesService {
  constructor(
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,
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
}
