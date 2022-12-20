import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { IUsersService } from 'src/users/user';
import { Services } from 'src/utils/constants';
import { Friend, FriendRequest } from 'src/utils/typeorm';
import {
  AcceptFriendRequestParams,
  CancelFriendRequestParams,
  CreateFriendRequestParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { FriendRequestException } from './exceptions/FriendRequest';
import { FriendRequestAcceptedException } from './exceptions/FriendRequestAccepted';
import { FriendRequestNotFoundException } from './exceptions/FriendRequestNotFound';
import { FriendRequestPendingException } from './exceptions/FriendRequestPending';
import { FriendRequestRejectedException } from './exceptions/FriendRequestRejected';
import { NotFriendRequestReceiverException } from './exceptions/NotFriendRequestReceiver';
import { NotFriendRequestSenderException } from './exceptions/NotFriendRequestSender';
import { IFriendRequestsService } from './friend-requests';

@Injectable()
export class FriendRequestsService implements IFriendRequestsService {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly friendRequestsRepository: Repository<FriendRequest>,
    @InjectRepository(Friend)
    private readonly friendsRepository: Repository<Friend>,
    @Inject(Services.USERS) private readonly usersService: IUsersService,
  ) {}

  async create(params: CreateFriendRequestParams): Promise<FriendRequest> {
    const { user: sender, email } = params;

    const receiver = await this.usersService.findUser({ email });
    if (!receiver) throw new UserNotFoundException();
    if (sender.id === receiver.id)
      throw new HttpException(
        'Cannot create friend request with yourself',
        HttpStatus.BAD_REQUEST,
      );

    const exists = await this.isPending(sender.id, receiver.id);
    if (exists) throw new FriendRequestPendingException();
    const isFriend = await this.isFriends(sender.id, receiver.id);
    if (isFriend) throw new FriendRequestAcceptedException();

    const friend = await this.friendRequestsRepository.create({
      sender,
      receiver,
      status: 'pending',
    });
    return this.friendRequestsRepository.save(friend);
  }

  async getFriendRequests(userId: number): Promise<FriendRequest[]> {
    const status = 'pending';
    return this.friendRequestsRepository.find({
      where: [
        {
          sender: { id: userId },
          status,
        },
        {
          receiver: { id: userId },
          status,
        },
      ],
      relations: {
        sender: true,
        receiver: true,
      },
    });
  }

  async accept(params: AcceptFriendRequestParams): Promise<Friend> {
    const { id, userId } = params;

    const friendRequest = await this.findById(id);
    if (!friendRequest) throw new FriendRequestNotFoundException();
    if (friendRequest.status === 'accepted')
      throw new FriendRequestAcceptedException();
    if (friendRequest.receiver.id !== userId)
      throw new FriendRequestException();
    friendRequest.status = 'accepted';
    await this.friendRequestsRepository.save(friendRequest);
    const newFriend = this.friendsRepository.create({
      sender: friendRequest.sender,
      receiver: friendRequest.receiver,
    });
    return this.friendsRepository.save(newFriend);
  }

  async cancel(params: CancelFriendRequestParams) {
    const { id, userId } = params;

    const friendRequest = await this.findById(id);
    if (!friendRequest) throw new FriendRequestNotFoundException();
    if (friendRequest.status === 'accepted')
      throw new FriendRequestAcceptedException();
    if (friendRequest.sender.id !== userId)
      throw new NotFriendRequestSenderException();

    return this.friendRequestsRepository.delete({
      id,
    });
  }

  async reject(params: CancelFriendRequestParams) {
    const { id, userId } = params;

    const friendRequest = await this.findById(id);
    if (!friendRequest) throw new FriendRequestNotFoundException();
    if (friendRequest.status === 'accepted')
      throw new FriendRequestAcceptedException();
    if (friendRequest.status === 'rejected')
      throw new FriendRequestRejectedException();
    if (friendRequest.receiver.id !== userId)
      throw new NotFriendRequestReceiverException();
    friendRequest.status = 'rejected';
    return this.friendRequestsRepository.save(friendRequest);
  }

  isPending(userOneId: number, userTwoId: number) {
    return this.friendRequestsRepository.findOne({
      where: [
        {
          sender: { id: userOneId },
          receiver: { id: userTwoId },
          status: 'pending',
        },
        {
          sender: { id: userTwoId },
          receiver: { id: userOneId },
          status: 'pending',
        },
      ],
    });
  }

  isFriends(userOneId: number, userTwoId: number) {
    return this.friendRequestsRepository.findOne({
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

  findById(id: number): Promise<FriendRequest> {
    return this.friendRequestsRepository.findOne({
      where: { id },
      relations: {
        sender: true,
        receiver: true,
      },
    });
  }
}
