import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class BoardAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthRequest<{ boardId: string }, { boardId?: string }>>();
    const userId = request.user.userId;
    const boardId = request.params.boardId || request.body.boardId;

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });

    if (!board) throw new NotFoundException('Board not found');

    const isAuthorized = board.ownerId === userId || board.members.some((m) => m.userId === userId);

    if (!isAuthorized) throw new ForbiddenException('Access denied to this board');

    return true;
  }
}
