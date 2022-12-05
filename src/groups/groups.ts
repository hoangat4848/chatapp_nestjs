import { Group } from 'src/utils/typeorm/entities/Group';
import { CreateGroupParams, FetchGroupParams } from 'src/utils/types';

export interface IGroupsService {
  createGroup(params: CreateGroupParams): Promise<Group>;
  getGroups(params: FetchGroupParams): Promise<Group[]>;
  getGroupById(id: number): Promise<Group>;
}
