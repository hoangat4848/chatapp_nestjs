import { HttpStatus, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { IUsersService } from 'src/users/user';
import { Services } from 'src/utils/constants';
import { AddGroupRecipientParams } from 'src/utils/types';
import { IGroupRecipientsService } from '../interfaces/group-recipients';
import { IGroupsService } from '../interfaces/groups';

@Injectable()
export class GroupRecipientsService implements IGroupRecipientsService {
  constructor(
    @Inject(Services.GROUPS) private readonly groupsService: IGroupsService,
    @Inject(Services.USERS) private readonly usersService: IUsersService,
  ) {}

  async addGroupRecipient(params: AddGroupRecipientParams) {
    const { userId, groupId, email } = params;
    const group = await this.groupsService.findGroupById(groupId);
    if (!group)
      throw new HttpException('Group Not Found', HttpStatus.BAD_REQUEST);

    if (userId !== group.creator.id)
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

    return this.groupsService.saveGroup(group);
  }
}
