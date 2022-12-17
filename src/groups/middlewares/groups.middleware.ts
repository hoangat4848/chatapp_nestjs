import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { Services } from '../../utils/constants';
import { AuthenticatedRequest } from '../../utils/types';
import { GroupNotFoundException } from '../exceptions/GroupNotFound';
import { InvalidGroupException } from '../exceptions/InvalidGroup';
import { IGroupsService } from '../interfaces/groups';

@Injectable()
export class GroupMiddleware implements NestMiddleware {
  constructor(
    @Inject(Services.GROUPS)
    private readonly groupService: IGroupsService,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { id: userId } = req.user;

    const groupId = parseInt(req.params.id);
    if (isNaN(groupId)) throw new InvalidGroupException();
    const params = { id: groupId, userId };
    const userInGroup = await this.groupService.hasAccess(params);

    if (userInGroup) next();
    else throw new GroupNotFoundException();
  }
}
