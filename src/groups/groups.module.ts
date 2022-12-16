import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Services } from 'src/utils/constants';
import { GroupMessage } from 'src/utils/typeorm';
import { Group } from 'src/utils/typeorm/entities/Group';
import { GroupMessagesController } from './controllers/group-messages.controller';
import { GroupRecipientsController } from './controllers/group-recipients.controller';
import { GroupsController } from './controllers/groups.controller';
import { GroupMessagesService } from './services/group-messages.service';
import { GroupRecipientsService } from './services/group-recipients.service';
import { GroupsService } from './services/groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMessage]), UsersModule],
  controllers: [
    GroupsController,
    GroupMessagesController,
    GroupRecipientsController,
  ],
  providers: [
    {
      provide: Services.GROUPS,
      useClass: GroupsService,
    },
    {
      provide: Services.GROUP_MESSAGES,
      useClass: GroupMessagesService,
    },
    {
      provide: Services.GROUP_RECIPIENTS,
      useClass: GroupRecipientsService,
    },
  ],
  exports: [
    {
      provide: Services.GROUPS,
      useClass: GroupsService,
    },
  ],
})
export class GroupsModule {}
