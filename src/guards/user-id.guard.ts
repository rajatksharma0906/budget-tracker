import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { findUserById } from '../../lib/db/queries/users';

@Injectable()
export class UserIdGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = (request.headers['x-user-id'] as string)?.trim();
    if (!userId) {
      throw new UnauthorizedException({ error: 'Unauthorized' });
    }
    try {
      const user = await findUserById(userId);
      if (!user) {
        throw new NotFoundException({ error: 'User not found' });
      }
      request.userId = userId;
      return true;
    } catch (e: any) {
      if (e instanceof UnauthorizedException || e instanceof NotFoundException) throw e;
      throw new UnauthorizedException({ error: 'Unauthorized' });
    }
  }
}
