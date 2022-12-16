import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUsersService } from 'src/users/user';
import { Services } from 'src/utils/constants';
import { Group } from 'src/utils/typeorm/entities/Group';
import { CreateGroupParams, FetchGroupParams } from 'src/utils/types';
import { Repository } from 'typeorm';
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
    const usersPromise = users.map((email) =>
      this.usersService.findUser({ email }),
    );
    const usersDB = (await Promise.all(usersPromise)).filter(
      (user) => user && user.id !== creator.id,
    );
    usersDB.push(creator);
    const group = this.groupsRepository.create({
      users: usersDB,
      creator,
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
        users: true,
        lastMessageSent: true,
      },
    });

    return group;
  }

  async saveGroup(group: Group): Promise<Group> {
    return this.groupsRepository.save(group);
  }
}
