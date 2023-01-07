import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { IUsersService } from 'src/users/interfaces/user';
import { Services } from 'src/utils/constants';
import { Group } from 'src/utils/typeorm/entities/Group';
import {
  AccessParams,
  CreateGroupParams,
  FetchGroupParams,
  TransferGroupOwnerParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { GroupNotFoundException } from '../exceptions/GroupNotFound';
import { GroupOwnerTransferException } from '../exceptions/GroupOwnerTransferException';
import { NotGroupOwnerException } from '../exceptions/NotGroupOwner';
import { IGroupsService } from '../interfaces/groups';

@Injectable()
export class GroupsService implements IGroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
    @Inject(Services.USERS)
    private readonly usersService: IUsersService,
  ) {}

  async createGroup(params: CreateGroupParams): Promise<Group> {
    const { creator, users, title } = params;
    const usersPromise = users.map((username) =>
      this.usersService.findUser({ username }),
    );
    const usersDB = (await Promise.all(usersPromise)).filter(
      (user) => user && user.id !== creator.id,
    );
    usersDB.push(creator);
    const group = this.groupsRepository.create({
      users: usersDB,
      creator,
      owner: creator,
      title,
    });

    return this.groupsRepository.save(group);
  }

  async getGroups({ userId }: FetchGroupParams): Promise<Group[]> {
    const groups = await this.groupsRepository
      .createQueryBuilder('groups')
      .leftJoinAndSelect('groups.users', 'user')
      .where('user.id = :id', { id: userId })
      .leftJoinAndSelect('groups.users', 'users')
      .leftJoinAndSelect('groups.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('groups.creator', 'creator')
      .leftJoinAndSelect('groups.owner', 'owner')
      .leftJoinAndSelect('users.profile', 'usersProfile')
      .orderBy('groups.lastMessageSentAt', 'DESC')
      .getMany();

    return groups;
  }

  async findGroupById(id: number): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: {
        id,
      },
      relations: {
        creator: true,
        owner: true,
        users: {
          profile: true,
        },
        lastMessageSent: true,
      },
    });

    return group;
  }

  async saveGroup(group: Group): Promise<Group> {
    return this.groupsRepository.save(group);
  }

  async hasAccess(params: AccessParams): Promise<boolean> {
    const { id: groupId, userId } = params;

    const group = await this.findGroupById(groupId);
    if (!group) throw new GroupNotFoundException();

    const userInGroup = group.users.find((u) => u.id === userId);
    return userInGroup ? true : false;
  }

  async transferGroupOwner(params: TransferGroupOwnerParams): Promise<Group> {
    const { userId, groupId, newOwnerId } = params;

    const group = await this.findGroupById(groupId);
    if (!group) throw new GroupNotFoundException();
    console.log(group);

    if (group.owner.id !== userId) throw new NotGroupOwnerException();
    if (group.owner.id === newOwnerId)
      throw new GroupOwnerTransferException(
        'Cannot Transfer Owner To Yourself',
      );
    if (!group.users.find((user) => user.id === newOwnerId))
      throw new UserNotFoundException();

    const newOwner = await this.usersService.findUser({ id: newOwnerId });
    if (!newOwner) throw new UserNotFoundException();

    group.owner = newOwner;
    return this.groupsRepository.save(group);
  }
}
