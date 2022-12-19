import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { send } from 'process';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { IUsersService } from 'src/users/user';
import { Services } from 'src/utils/constants';
import { Friend } from 'src/utils/typeorm';
import { CreateFriendParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { FriendRequestPendingException } from './exceptions/FriendRequestPending';
import { IFriendsService } from './friends';

@Injectable()
export class FriendsService implements IFriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendsRepository: Repository<Friend>,
    @Inject(Services.USERS) private readonly usersService: IUsersService,
  ) {}

  async createFriendRequest(params: CreateFriendParams): Promise<Friend> {
    const { user: sender, email } = params;
    const receiver = await this.usersService.findUser({ email });
    if (!receiver) throw new UserNotFoundException();

    const exists = await this.isFriendRequestPending(sender.id, receiver.id);
    if (exists) throw new FriendRequestPendingException();

    const friend = this.friendsRepository.create({
      sender,
      receiver,
      status: 'pending',
    });
    return this.friendsRepository.save(friend);
  }

  isFriendRequestPending(
    userOneId: number,
    userTwoId: number,
  ): Promise<Friend> {
    return this.friendsRepository.findOne({
      where: [
        {
          sender: {
            id: userOneId,
          },
          receiver: {
            id: userTwoId,
          },
          status: 'pending',
        },
        {
          sender: {
            id: userTwoId,
          },
          receiver: {
            id: userOneId,
          },
          status: 'pending',
        },
      ],
    });
  }

  isFriends(userOneId: number, userTwoId: number): Promise<Friend> {
    return this.friendsRepository.findOne({
      where: [
        {
          sender: { id: userOneId },
          receiver: { id: userTwoId },
          status: 'accepted',
        },
        {
          sender: { id: userTwoId },
          receiver: { id: userOneId },
          status: 'accepted',
        },
      ],
    });
  }
}
