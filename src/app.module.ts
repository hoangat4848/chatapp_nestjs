import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConversationsModule } from './conversations/conversations.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import entities from './utils/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GatewayModule } from './gateway/gateway.module';
import { DataSource } from 'typeorm';
import { GroupsModule } from './groups/groups.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ envFilePath: '.env.development' }),
    PassportModule.register({ session: true }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE,
      host: process.env.MYSQL_DB_HOST,
      port: parseInt(process.env.MYSQL_DB_PORT),
      username: process.env.MYSQL_DB_USERNAME,
      password: process.env.MYSQL_DB_PASSWORD,
      database: process.env.MYSQL_DB_DATABASE,
      entities,
      synchronize: true,
      logging: true,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    AuthModule,
    UsersModule,
    ConversationsModule,
    MessagesModule,
    GatewayModule,
    GroupsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
