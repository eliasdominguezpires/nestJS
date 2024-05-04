import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { User, UserSchema } from './entities/user.entity';
import { TokenController } from './token.controller';

@Module({
  controllers: [AuthController, TokenController],
  providers: [AuthService],
  imports: [
    ConfigModule.forRoot(),

    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      }
    ]),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ]
})
export class AuthModule { }
