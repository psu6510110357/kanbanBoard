import { Controller, Post, Body, Param, UseGuards, Put, Delete, Get, Req } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { TaskOrderDto } from './dto/order-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { AddTagDto } from './dto/add-tag.dto';
import { RemoveTagDto } from './dto/remove-tag.dto';
import { AssignMemberDto } from './dto/assign-member.dto';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { BoardAccessGuard } from 'src/common/guards/board-access.guard';
@UseGuards(JwtAuthGuard)
@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(BoardAccessGuard)
  @Post('columns/:columnId/tasks')
  createTask(@Param('columnId') columnId: string, @Body() dto: CreateTaskDto) {
    return this.taskService.createTask(columnId, dto.title);
  }

  @UseGuards(BoardAccessGuard)
  @Post('tags/add')
  addTag(@Body() dto: AddTagDto) {
    return this.taskService.addTagToTask(dto.taskId, dto.name);
  }

  @UseGuards(BoardAccessGuard)
  @Post('tags/remove')
  removeTag(@Body() dto: RemoveTagDto) {
    return this.taskService.removeTagFromTask(dto.taskId, dto.tagId);
  }

  @UseGuards(BoardAccessGuard)
  @Post('tasks/:taskId/assign')
  assignUser(
    @Param('taskId') taskId: string,
    @Body() dto: AssignMemberDto,
    @Req() req: AuthRequest,
  ) {
    return this.taskService.assignMemberToTask(taskId, dto.userId, req.user.userId);
  }

  @UseGuards(BoardAccessGuard)
  @Get('columns/:columnId/tasks')
  getTasks(@Param('columnId') columnId: string) {
    return this.taskService.getTasksByColumnId(columnId);
  }

  @UseGuards(BoardAccessGuard)
  @Get('tasks/:taskId')
  async getTask(@Param('taskId') taskId: string) {
    return this.taskService.getTaskByIdWithTagsAndAssignees(taskId);
  }

  @UseGuards(BoardAccessGuard)
  @Put('tasks/:taskId')
  updateTask(@Param('taskId') taskId: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.updateTask(taskId, dto);
  }

  @UseGuards(BoardAccessGuard)
  @Put('columns/:columnId/tasks/reorder')
  reorderTasks(@Param('columnId') columnId: string, @Body() taskOrder: TaskOrderDto[]) {
    return this.taskService.reorderTasks(columnId, taskOrder);
  }

  @UseGuards(BoardAccessGuard)
  @Put('tasks/:taskId/move')
  moveTask(@Param('taskId') taskId: string, @Body() dto: MoveTaskDto) {
    return this.taskService.moveTaskToColumn(taskId, dto.targetColumnId, dto.newOrder);
  }

  @UseGuards(BoardAccessGuard)
  @Delete('tasks/:taskId')
  deleteTask(@Param('taskId') taskId: string) {
    return this.taskService.deleteTask(taskId);
  }

  @UseGuards(BoardAccessGuard)
  @Delete('tasks/:taskId/unassign/:userId')
  unassignUser(@Param('taskId') taskId: string, @Param('userId') userId: string) {
    return this.taskService.unassignMemberFromTask(taskId, userId);
  }
}
