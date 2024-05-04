import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

import { AuthGuard } from './guards/auth.guard';
import { User } from './entities/user.entity';

@Controller('token')
export class TokenController {
  constructor(private readonly authService: AuthService) { }

  @Get("check-token")
  @UseGuards(AuthGuard)
  checkToken(@Request() req: Request) {
    const user = req["user"] as User;

    return {
      user,
      token: this.authService.getJWT({ id: user._id })
    }
  }
}