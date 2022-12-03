import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'src/utils/typeorm/entities/Group';
import { Repository } from 'typeorm';
import { IGroupsService } from './groups';

@Injectable()
export class GroupsService implements IGroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
  ) {}
}
