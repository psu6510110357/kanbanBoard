import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBoardDto, ownerId: string) {
    return this.prisma.board.create({
      data: {
        title: dto.title,
        ownerId,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  async findInitialBoardByBoardId(boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
              include: {
                tags: true,
                assignees: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        username: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async findOne(boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
        members: {
          include: { user: true },
        },
        columns: true,
      },
    });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async updateTitle(boardId: string, dto: UpdateBoardDto) {
    try {
      const updatedBoard = await this.prisma.board.update({
        where: { id: boardId },
        data: dto,
      });
      return updatedBoard;
    } catch (error) {
      throw new Error(`Board with ID ${boardId} not found.` + error);
    }
  }

  async remove(boardId: string): Promise<void> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          include: {
            tasks: {
              select: {
                id: true,
              },
            },
          },
        },
        members: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!board) {
      this.logger.warn(`Attempted to delete non-existent board with ID: ${boardId}`);
      throw new NotFoundException(`Board with ID ${boardId} not found.`);
    }

    try {
      await this.prisma.$transaction(async (prisma) => {
        const taskIdsToDelete = board.columns.flatMap((column) =>
          column.tasks.map((task) => task.id),
        );

        if (taskIdsToDelete.length > 0) {
          await prisma.taskAssignee.deleteMany({
            where: {
              taskId: {
                in: taskIdsToDelete,
              },
            },
          });
          this.logger.log(
            `Deleted ${taskIdsToDelete.length} task assignees for board ID: ${boardId}`,
          );
        }

        if (board.columns.length > 0) {
          await prisma.task.deleteMany({
            where: {
              columnId: {
                in: board.columns.map((column) => column.id),
              },
            },
          });
          this.logger.log(
            `Deleted tasks for ${board.columns.length} columns in board ID: ${boardId}`,
          );
        }

        if (board.columns.length > 0) {
          await prisma.column.deleteMany({
            where: {
              boardId: boardId,
            },
          });
          this.logger.log(`Deleted ${board.columns.length} columns in board ID: ${boardId}`);
        }

        if (board.members.length > 0) {
          await prisma.boardMember.deleteMany({
            where: {
              boardId: boardId,
            },
          });
          this.logger.log(`Deleted ${board.members.length} members from board ID: ${boardId}`);
        }

        await prisma.board.delete({
          where: { id: boardId },
        });
        this.logger.log(`Successfully deleted board titled "${board.title}" (ID: ${boardId})`);
      });
    } catch (error) {
      this.logger.error(`Error deleting board with ID: ${boardId}`, error);
      throw error;
    }
  }

  async addMember(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) throw new NotFoundException('Board not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const exists = await this.prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId,
        },
      },
    });

    if (exists) throw new ConflictException('User is already a board member');

    return this.prisma.boardMember.create({
      data: {
        boardId,
        userId,
      },
    });
  }
}
