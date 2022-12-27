import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Services } from 'src/utils/constants';
import { Profile, User } from 'src/utils/typeorm';
import { UserProfilesController } from './controllers/user-profiles.controller';
import { UsersController } from './controllers/users.controller';
import { UserProfilesService } from './services/user-profiles.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile])],
  controllers: [UsersController, UserProfilesController],
  providers: [
    {
      provide: Services.USERS,
      useClass: UsersService,
    },
    {
      provide: Services.USER_PROFILES,
      useClass: UserProfilesService,
    },
  ],
  exports: [
    {
      provide: Services.USERS,
      useClass: UsersService,
    },
    {
      provide: Services.USER_PROFILES,
      useClass: UserProfilesService,
    },
  ],
})
export class UsersModule {}
