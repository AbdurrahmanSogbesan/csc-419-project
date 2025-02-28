import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('Authentication required');
    }

    // Fetch the full user to get the role
    const fullUser = await this.prisma.user.findUnique({
      where: { uuid: user.sub },
      select: { role: true },
    });

    if (!fullUser) {
      throw new ForbiddenException('User not found');
    }

    // Check if user has admin role
    if (fullUser.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only administrators can access this resource',
      );
    }

    return true;
  }
}
