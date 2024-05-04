import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService,
    private authService: AuthService,
  ) { }

  async canActivate(context: ExecutionContext,): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("Mensaje");
    }

    //console.log("canActivate", request);
    console.log("extractTokenFromHeader", token);
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        {
          secret: process.env.JWT_KEY,
        }
      );
      console.log(payload);

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers

      const user = await this.authService.findUserById(payload.id);
      if (!user) { throw new UnauthorizedException("No existe Usuario"); }
      if (!user.isActive) { throw new UnauthorizedException("Usuario Inactivo"); }

      request['user'] = user;
      request['payload'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    // return Promise.resolve(true);
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

}
