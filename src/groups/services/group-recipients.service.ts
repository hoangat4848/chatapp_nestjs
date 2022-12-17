import { HttpStatus, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { IUsersService } from 'src/users/user';
import { Services } from 'src/utils/constants';
import { Group } from 'src/utils/typeorm';
import {
  AddGroupRecipientParams,
  RemoveGroupRecipientParams,
  RemoveGroupUserReponse,
} from 'src/utils/types';
import { NotFoundGroupException } from '../exceptions/NotFoundGroup';
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
    const { issuerId, groupId, email } = params;
    const group = await this.groupsService.findGroupById(groupId);
    if (!group)
      throw new HttpException('Group Not Found', HttpStatus.BAD_REQUEST);

    if (issuerId !== group.creator.id)
      throw new HttpException('Insufficient Permissions', HttpStatus.FORBIDDEN);

    const recipient = await this.usersService.findUser({ email });
    if (!recipient)
      throw new HttpException('Recipient Not Found', HttpStatus.BAD_REQUEST);

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
    if (!group) throw new NotFoundGroupException();

    console.log('OI!!!!!');
    console.log(`issuerId: ${issuerId}, creator: ${group.creator.id}`);

    // Not group owner
    if (issuerId !== group.creator.id) throw new NotGroupOwnerException();
    // Not removing self
    if (group.creator.id === removeUserId)
      throw new HttpException(
        'Cannot remove yourself as owner',
        HttpStatus.BAD_REQUEST,
      );

    group.users = group.users.filter((user) => user.id !== removeUserId);

    const savedGroup = await this.groupsService.saveGroup(group);
    return { group: savedGroup, user: userToBeRemoved };
  }
}
