import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie';
import { DataSource, getRepository } from 'typeorm';
import { Session, User } from 'src/utils/typeorm';
import { plainToInstance } from 'class-transformer';
import { INestApplication } from '@nestjs/common';

export class WebsocketAdapter extends IoAdapter {
  constructor(private app: INestApplication) {
    super(app);
  }

  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);

    server.use(async (socket: AuthenticatedSocket, next) => {
      const sessionRepository = this.app.get(DataSource).getRepository(Session);
      const { cookie: clientCookie } = socket.handshake.headers;
      if (!clientCookie) {
        console.log('Client has no cookies');
        return next(new Error('Not authenticated'));
      }
      const { CHAT_APP_SESSION_ID } = cookie.parse(clientCookie);
      if (!CHAT_APP_SESSION_ID) {
        console.log('CHAT_APP_SESSION_ID DOES NOT EXIST');
        return next(new Error('Not authenticated'));
      }
      const signedCookie = cookieParser.signedCookie(
        CHAT_APP_SESSION_ID,
        process.env.COOKIE_SECRET,
      );
      if (!signedCookie) return next(new Error('Error signing cookie'));
      const sessionDB = await sessionRepository.findOneBy({ id: signedCookie });
      const userDB = plainToInstance(
        User,
        JSON.parse(sessionDB.json).passport.user,
      );
      socket.user = userDB;
      next();
    });

    return server;
  }
}
