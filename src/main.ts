import 'reflect-metadata';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { Session } from './utils/typeorm';
import { TypeormStore } from 'connect-typeorm/out';
import { DataSource } from 'typeorm';
import { WebsocketAdapter } from './gateway/gateway.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { PORT, COOKIE_SECRET } = process.env;
  const adapter = new WebsocketAdapter(app);
  app.useWebSocketAdapter(adapter);

  app.enableCors({ origin: ['http://localhost:3000'], credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // console.log(AppDataSource.options);
  const sessionRepository = app.get(DataSource).getRepository(Session);

  app.use(
    session({
      secret: COOKIE_SECRET,
      saveUninitialized: false,
      resave: false,
      name: 'CHAT_APP_SESSION_ID',
      cookie: {
        maxAge: 86400000, // cookie expires 1 day later
      },
      store: new TypeormStore().connect(sessionRepository),
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  try {
    await app.listen(PORT, () => {
      console.log(`app is listening on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}
bootstrap();
