import { Controller, Get, Inject } from '@nestjs/common';
import { Routes, Services } from 'src/utils/constants';
import { IGroupsService } from './groups';

@Controller(Routes.GROUPS)
export class GroupsController {
  constructor(@Inject(Services.GROUPS) groupsService: IGroupsService) {}

  @Get()
  getGroups() {
    return 'ok';
  }
}
