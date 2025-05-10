import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class BoardOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthRequest<{ boardId: string }, { boardId?: string }>>();
    const userId = request.user.userId;
    const boardId = request.params.boardId || request.body.boardId;

    if (!boardId) {
      throw new BadRequestException('Board ID is required');
    }

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) throw new NotFoundException('Board not found');

    if (board.ownerId !== userId) {
      throw new ForbiddenException('Only the board owner can perform this action');
    }

    return true;
  }
}
