import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Services } from 'src/utils/constants';
import { GroupMessage } from 'src/utils/typeorm';
import { Group } from 'src/utils/typeorm/entities/Group';
import { GroupMessagesController } from './controllers/group-messages.controller';
import { GroupsController } from './controllers/groups.controller';
import { GroupMessagesService } from './services/group-messages.service';
import { GroupsService } from './services/groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMessage]), UsersModule],
  controllers: [GroupsController, GroupMessagesController],
  providers: [
    {
      provide: Services.GROUPS,
      useClass: GroupsService,
    },
    {
      provide: Services.GROUP_MESSAGES,
      useClass: GroupMessagesService,
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
