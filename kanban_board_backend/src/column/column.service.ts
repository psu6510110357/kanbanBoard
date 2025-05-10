import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ColumnOrder } from './column.interface';

@Injectable()
export class ColumnService {
  private readonly logger = new Logger(ColumnService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createColumn(boardId: string, name: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException('Board not found');

    const count = await this.prisma.column.count({
      where: { boardId },
    });

    return this.prisma.column.create({
      data: {
        name,
        order: count + 1, // place at last
        boardId,
      },
    });
  }

  async getColumns(boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: true,
      },
    });

    if (!board) throw new NotFoundException('Board not found');
    return this.prisma.column.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
    });
  }

  async updateNameColumn(columnId: string, name?: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });
    if (!column) throw new NotFoundException('Column not found');

    return this.prisma.column.update({
      where: { id: columnId },
      data: {
        name,
      },
    });
  }

  async deleteColumn(columnId: string): Promise<void> {
    const columnToDelete = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: {
        tasks: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!columnToDelete) {
      this.logger.warn(`Attempted to delete non-existent column with ID: ${columnId}`);
      throw new NotFoundException('Column not found');
    }

    try {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.taskAssignee.deleteMany({
          where: {
            taskId: {
              in: columnToDelete.tasks.map((task) => task.id),
            },
          },
        });

        await prisma.task.deleteMany({
          where: {
            columnId: columnId,
          },
        });

        await prisma.column.delete({
          where: { id: columnId },
        });
        this.logger.log(`Successfully deleted column with ID: ${columnId}`);

        const remainingColumns = await prisma.column.findMany({
          where: { boardId: columnToDelete.boardId, order: { gt: columnToDelete.order } },
          orderBy: { order: 'asc' },
        });

        await Promise.all(
          remainingColumns.map((column, index) =>
            prisma.column.update({
              where: { id: column.id },
              data: { order: columnToDelete.order + index },
            }),
          ),
        );
        this.logger.log(
          `Reordered ${remainingColumns.length} columns in board ID: ${columnToDelete.boardId} after deleting column ID: ${columnId}`,
        );
      });
    } catch (error) {
      this.logger.error(`Error deleting column with ID: ${columnId}: ${error}`);
      throw error;
    }
  }

  async reorderColumns(boardId: string, columnOrder: ColumnOrder[]) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const existing = await this.prisma.column.findMany({
      where: { boardId },
    });

    if (columnOrder.length !== existing.length) {
      throw new BadRequestException('You must provide all columns for reordering.');
    }

    const columns = await this.prisma.column.findMany({
      where: {
        id: { in: columnOrder.map((c) => c.columnId) },
      },
    });

    const invalidColumns = columns.filter((col) => col.boardId !== boardId);
    if (invalidColumns.length > 0) {
      throw new BadRequestException('Some columns do not belong to the specified board');
    }

    for (let i = 0; i < columnOrder.length; i++) {
      await this.prisma.column.update({
        where: { id: columnOrder[i].columnId },
        data: { order: -1000 - i }, // use unique temp values to prevent uniqueness conflict
      });
    }

    for (let i = 0; i < columnOrder.length; i++) {
      await this.prisma.column.update({
        where: { id: columnOrder[i].columnId },
        data: { order: i + 1 },
      });
    }

    return { message: 'Columns reordered successfully' };
  }
}
