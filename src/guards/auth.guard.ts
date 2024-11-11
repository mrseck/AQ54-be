import { 
    Injectable, 
    ExecutionContext, 
    UnauthorizedException, 
    Logger 
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { ConfigService } from '@nestjs/config';
  import { Request } from 'express';
  
  @Injectable()
  export class AuthGuard {
    private readonly logger = new Logger(AuthGuard.name);
  
    constructor(
      private jwtService: JwtService,
      private configService: ConfigService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
  
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }
  
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('JWT_SECRET')
        });
  
        // Enrichir la requête avec les informations de l'utilisateur
        request.user = {
          userId: payload.sub,
          email: payload.email,
          role: payload.role,
          username: payload.username
        };
  
        return true;
      } catch (error) {
        this.logger.error(`JWT Verification failed: ${error.message}`);
        throw new UnauthorizedException('Invalid token');
      }
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }