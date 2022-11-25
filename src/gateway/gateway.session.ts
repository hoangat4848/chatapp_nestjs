import { Injectable } from '@nestjs/common';
import { AuthenticatedSocket } from 'src/utils/interfaces';

export interface IGatewaySession {
  getUserSocket(id: number): AuthenticatedSocket;
  setUserSocket(id: number, socket: AuthenticatedSocket): void;
  removeUserSocket(id: number): void;
  getSockets(): Map<number, AuthenticatedSocket>;
}

@Injectable()
export class GatewaySessionManager implements IGatewaySession {
  private sessions: Map<number, AuthenticatedSocket>;
  constructor() {
    this.sessions = new Map<number, AuthenticatedSocket>();
  }

  getUserSocket(id: number): AuthenticatedSocket {
    return this.sessions.get(id);
  }

  setUserSocket(userId: number, socket: AuthenticatedSocket) {
    this.sessions.set(userId, socket);
  }

  removeUserSocket(userId: number) {
    this.sessions.delete(userId);
  }

  getSockets(): Map<number, AuthenticatedSocket> {
    return this.sessions;
  }
}
