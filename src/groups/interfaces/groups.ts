import { Group } from 'src/utils/typeorm/entities/Group';
import { CreateGroupParams, FetchGroupParams } from 'src/utils/types';

export interface IGroupsService {
  createGroup(params: CreateGroupParams): Promise<Group>;
  getGroups(params: FetchGroupParams): Promise<Group[]>;
  findGroupById(id: number): Promise<Group>;
  saveGroup(group: Group): Promise<Group>;
}