import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsModule } from 'src/groups/groups.module';
import { Services } from 'src/utils/constants';
import { GroupMessage } from 'src/utils/typeorm';
import { GroupMessagesController } from './group-messages.controller';
import { GroupMessagesService } from './group-messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([GroupMessage]), GroupsModule],
  controllers: [GroupMessagesController],
  providers: [
    {
      provide: Services.GROUP_MESSAGES,
      useClass: GroupMessagesService,
    },
  ],
})
export class GroupMessagesModule {}
