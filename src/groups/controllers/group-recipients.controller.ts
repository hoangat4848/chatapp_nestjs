import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  Body,
  Param,
} from '@nestjs/common/decorators/http/route-params.decorator';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { AddGroupRecipientParams } from 'src/utils/types';
import { AddGroupRecipientDto } from '../dtos/AddGroupRecipient.dto';
import { IGroupRecipientsService } from '../interfaces/group-recipients';

@Controller(Routes.GROUP_RECIPIENTS)
@UseGuards(AuthenticatedGuard)
export class GroupRecipientsController {
  constructor(
    @Inject(Services.GROUP_RECIPIENTS)
    private readonly groupRecipientsService: IGroupRecipientsService,
  ) {}

  @Post()
  async addGroupRecipient(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) groupId: number,
    @Body() { email }: AddGroupRecipientDto,
  ) {
    const params: AddGroupRecipientParams = { userId, groupId, email };
    return this.groupRecipientsService.addGroupRecipient(params);
  }
}
