import { Injectable } from '@nestjs/common';
import { IFriendsService } from './friends';

@Injectable()
export class FriendsService implements IFriendsService {}
