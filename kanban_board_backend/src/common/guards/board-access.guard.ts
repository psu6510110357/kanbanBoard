import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class BoardAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<
        AuthRequest<
          { boardId: string; columnId: string; taskId: string },
          { boardId?: string; columnId?: string; taskId?: string }
        >
      >();
    const userId = request.user.userId;

    const { boardId, columnId, taskId } = {
      ...request.params,
      ...request.body,
    };

    let finalBoardId = boardId;

    if (!finalBoardId && columnId) {
      const column = await this.prisma.column.findUnique({
        where: { id: columnId },
      });
      if (!column) throw new NotFoundException('Column not found');
      finalBoardId = column.boardId;
    }

    if (!finalBoardId && taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: {
          column: true,
        },
      });
      if (!task) throw new NotFoundException('Task not found');
      finalBoardId = task.column.boardId;
    }

    if (!finalBoardId) {
      throw new BadRequestException('Board ID is required for authorization');
    }

    const board = await this.prisma.board.findUnique({
      where: { id: finalBoardId },
      include: { members: true },
    });

    if (!board) throw new NotFoundException('Board not found');

    const isAuthorized = board.ownerId === userId || board.members.some((m) => m.userId === userId);

    if (!isAuthorized) {
      throw new ForbiddenException('You are not a member of this board');
    }

    return true;
  }
}
