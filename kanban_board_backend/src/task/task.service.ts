import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskOrder } from './task.interface';
import { BoardWithMembers } from 'src/board/board.interface';

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

  async addTagToTask(taskId: string, name: string) {
    const task = (await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { tags: true },
    })) as { id: string; tags: { id: string }[] } | null;
    if (!task) throw new NotFoundException('Task not found');

    let tag = await this.prisma.tag.findFirst({ where: { name } });

    if (!tag) {
      tag = await this.prisma.tag.create({ data: { name } });
    }

    // Check if tag is already assigned to task
    const alreadyLinked = task.tags.some((t) => t.id === tag.id);
    if (alreadyLinked) {
      throw new ConflictException('Tag is already attached to this task');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        tags: {
          connect: { id: tag.id },
        },
      },
      include: { tags: true },
    });
  }

  async removeTagFromTask(taskId: string, tagId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { tags: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    const isLinked = task.tags.some((t) => t.id === tagId);
    if (!isLinked) {
      throw new BadRequestException('This tag is not assigned to the task');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
      include: { tags: true },
    });
  }

  async assignMemberToTask(taskId: string, userId: string, currentUserId: string) {
    const task = await this.getTaskWithBoard(taskId);

    const board = task.column.board;

    this.ensureAssignerIsAuthorized(board, currentUserId);
    this.ensureAssigneeIsAuthorized(board, userId);

    const isAlreadyAssigned = await this.prisma.taskAssignee.findUnique({
      where: {
        taskId_userId: { taskId, userId },
      },
    });

    if (isAlreadyAssigned) {
      throw new ConflictException('User already assigned to this task');
    }

    const assignee = await this.prisma.taskAssignee.create({
      data: {
        taskId,
        userId,
      },
    });

    // 🔔 Optional: Trigger a notification
    // this.notificationService.notifyUser(userId, `You've been assigned to task ${task.title}`);

    return assignee;
  }

  private async getTaskWithBoard(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  private ensureAssignerIsAuthorized(board: BoardWithMembers, currentUserId: string) {
    const isAuthorized =
      board.ownerId === currentUserId || board.members.some((m) => m.userId === currentUserId);

    if (!isAuthorized) {
      throw new ForbiddenException('You cannot assign users on this board');
    }
  }

  private ensureAssigneeIsAuthorized(board: BoardWithMembers, userId: string) {
    const isAuthorized = board.ownerId === userId || board.members.some((m) => m.userId === userId);

    if (!isAuthorized) {
      throw new BadRequestException('User is not a member of the board');
    }
  }

  async unassignMemberFromTask(taskId: string, userId: string) {
    // ensure task exists
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    // ensure user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check if user is assigned to task
    const assignee = await this.prisma.taskAssignee.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });

    if (!assignee) {
      throw new BadRequestException('This user is not assigned to the task');
    }

    return this.prisma.taskAssignee.delete({
      where: { id: assignee.id },
    });
  }
}
