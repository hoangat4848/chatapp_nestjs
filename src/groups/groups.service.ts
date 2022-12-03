import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUsersService } from 'src/users/user';
import { Services } from 'src/utils/constants';
import { Group } from 'src/utils/typeorm/entities/Group';
import { CreateGroupParams, FetchGroupParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IGroupsService } from './groups';

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
    console.log(usersDB);
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
      .innerJoinAndSelect('groups.users', 'user')
      .where('user.id IN(:id)', { id: userId })
      .getMany();

    return groups;
  }
}
