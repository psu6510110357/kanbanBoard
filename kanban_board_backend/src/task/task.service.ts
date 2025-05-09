import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskOrder } from 'src/interface/taskOrder';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(columnId: string, title: string) {
    const column = await this.prisma.column.findUnique({ where: { id: columnId } });
    if (!column) throw new NotFoundException('Column not found');

    const count = await this.prisma.task.count({ where: { columnId } });

    return this.prisma.task.create({
      data: {
        title,
        order: count + 1,
        columnId,
      },
    });
  }

  async getTasksByColumnId(columnId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) throw new NotFoundException('Column not found');

    return this.prisma.task.findMany({
      where: { columnId },
      orderBy: { order: 'asc' }, // sort by order field
    });
  }

  async reorderTasks(columnId: string, taskOrder: TaskOrder[]) {
    const column = await this.prisma.column.findUnique({ where: { id: columnId } });
    if (!column) throw new NotFoundException('Column not found');

    const existing = await this.prisma.task.findMany({ where: { columnId } });

    if (existing.length !== taskOrder.length) {
      throw new BadRequestException('You must provide all tasks for reordering.');
    }

    const validTasks = await this.prisma.task.findMany({
      where: {
        id: { in: taskOrder.map((t) => t.taskId) },
      },
    });

    const invalidTasks = validTasks.filter((t) => t.columnId !== columnId);
    if (invalidTasks.length > 0) {
      throw new BadRequestException('Some tasks do not belong to this column');
    }

    for (let i = 0; i < taskOrder.length; i++) {
      await this.prisma.task.update({
        where: { id: taskOrder[i].taskId },
        data: { order: -1000 - i },
      });
    }

    for (let i = 0; i < taskOrder.length; i++) {
      await this.prisma.task.update({
        where: { id: taskOrder[i].taskId },
        data: { order: i + 1 },
      });
    }

    return { message: 'Tasks reordered successfully' };
  }

  async updateTask(taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id: taskId },
      data: { title: dto.title },
    });
  }

  async deleteTask(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.delete({ where: { id: taskId } });
  }

  async moveTaskToColumn(taskId: string, targetColumnId: string, newOrder: number) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const column = await this.prisma.column.findUnique({ where: { id: targetColumnId } });
    if (!column) throw new NotFoundException('Target column not found');

    const count = await this.prisma.task.count({
      where: { columnId: targetColumnId },
    });

    // Clamp newOrder to be in range [1, count + 1]
    const clampedOrder = Math.max(1, Math.min(newOrder, count + 1));

    // Temporarily set order to avoid conflict
    await this.prisma.task.update({
      where: { id: taskId },
      data: { order: -1000 },
    });

    // Shift tasks in target column
    await this.prisma.task.updateMany({
      where: {
        columnId: targetColumnId,
        order: {
          gte: clampedOrder,
        },
      },
      data: {
        order: { increment: 1 },
      },
    });

    // Move the task
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: targetColumnId,
        order: clampedOrder,
      },
    });
  }
}
