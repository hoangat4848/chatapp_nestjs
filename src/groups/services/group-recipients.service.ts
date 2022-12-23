import { HttpStatus, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { IUsersService } from 'src/users/user';
import { Services } from 'src/utils/constants';
import { Group } from 'src/utils/typeorm';
import {
  AddGroupRecipientParams,
  CheckUserInGroupParams,
  LeaveGroupParams,
  RemoveGroupRecipientParams,
  RemoveGroupUserReponse,
} from 'src/utils/types';
import { GroupNotFoundException } from '../exceptions/GroupNotFound';
import { GroupParticipantNotFound } from '../exceptions/GroupParticipantNotFound';
import { NotGroupOwnerException } from '../exceptions/NotGroupOwner';
import { IGroupRecipientsService } from '../interfaces/group-recipients';
import { IGroupsService } from '../interfaces/groups';

@Injectable()
export class GroupRecipientsService implements IGroupRecipientsService {
  constructor(
    @Inject(Services.GROUPS) private readonly groupsService: IGroupsService,
    @Inject(Services.USERS) private readonly usersService: IUsersService,
  ) {}

  async addGroupRecipient(params: AddGroupRecipientParams) {
    const { issuerId, groupId, username } = params;
    const group = await this.groupsService.findGroupById(groupId);
    if (!group)
      throw new HttpException('Group Not Found', HttpStatus.BAD_REQUEST);

    if (group.owner.id !== issuerId) throw new NotGroupOwnerException();

    const recipient = await this.usersService.findUser({ username });
    if (!recipient) throw new UserNotFoundException();

    const recipientInGroup = group.users.find(
      (user) => user.id === recipient.id,
    );
    if (recipientInGroup)
      throw new HttpException('User already in group', HttpStatus.BAD_REQUEST);
    group.users = [...group.users, recipient];

    const savedGroup = await this.groupsService.saveGroup(group);
    return { group: savedGroup, user: recipient };
  }

  async removeGroupRecipient(
    params: RemoveGroupRecipientParams,
  ): Promise<RemoveGroupUserReponse> {
    const { issuerId, groupId, removeUserId } = params;

    const userToBeRemoved = await this.usersService.findUser({
      id: removeUserId,
    });
    if (!userToBeRemoved)
      throw new HttpException('User cannot be removed', HttpStatus.BAD_REQUEST);

    const group = await this.groupsService.findGroupById(groupId);
    if (!group) throw new GroupNotFoundException();

    // Not group owner
    if (issuerId !== group.owner.id) throw new NotGroupOwnerException();
    // Not removing self
    if (group.owner.id === removeUserId)
      throw new HttpException(
        'Cannot remove yourself as owner',
        HttpStatus.BAD_REQUEST,
      );

    group.users = group.users.filter((user) => user.id !== removeUserId);

    const savedGroup = await this.groupsService.saveGroup(group);
    return { group: savedGroup, user: userToBeRemoved };
  }

  async isUserInGroup(params: CheckUserInGroupParams): Promise<Group> {
    const { groupId, userId } = params;
    const group = await this.groupsService.findGroupById(groupId);
    if (!group) throw new GroupNotFoundException();
    const userInGroup = group.users.find((user) => user.id === userId);
    if (!userInGroup) throw new GroupParticipantNotFound();
    return group;
  }

  async leaveGroup(params: LeaveGroupParams) {
    const { groupId, userId } = params;
    const group = await this.isUserInGroup({ groupId, userId });
    if (group.owner.id === userId)
      throw new HttpException(
        'Cannot leave group as owner',
        HttpStatus.BAD_REQUEST,
      );
    group.users = group.users.filter((user) => user.id !== userId);
    return this.groupsService.saveGroup(group);
  }
}
