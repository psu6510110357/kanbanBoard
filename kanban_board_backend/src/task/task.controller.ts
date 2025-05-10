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
@UseGuards(JwtAuthGuard)
@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // Create Task
  @Post('columns/:columnId/tasks')
  createTask(@Param('columnId') columnId: string, @Body() dto: CreateTaskDto) {
    return this.taskService.createTask(columnId, dto.title);
  }

  // Add Tag
  @Post('tags/add')
  addTag(@Body() dto: AddTagDto) {
    return this.taskService.addTagToTask(dto.taskId, dto.name);
  }

  // Remove Tag
  @Post('tags/remove')
  removeTag(@Body() dto: RemoveTagDto) {
    return this.taskService.removeTagFromTask(dto.taskId, dto.tagId);
  }

  // Assign Member
  @Post('tasks/:taskId/assign')
  assignUser(
    @Param('taskId') taskId: string,
    @Body() dto: AssignMemberDto,
    @Req() req: AuthRequest,
  ) {
    return this.taskService.assignMemberToTask(taskId, dto.userId, req.user.userId);
  }

  // Get Tasks
  @Get('columns/:columnId/tasks')
  getTasks(@Param('columnId') columnId: string) {
    return this.taskService.getTasksByColumnId(columnId);
  }

  // Reorder Tasks
  @Put('columns/:columnId/tasks/reorder')
  reorderTasks(@Param('columnId') columnId: string, @Body() taskOrder: TaskOrderDto[]) {
    return this.taskService.reorderTasks(columnId, taskOrder);
  }

  // Update Task
  @Put('tasks/:taskId')
  updateTask(@Param('taskId') taskId: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.updateTask(taskId, dto);
  }

  // Move Task
  @Put('tasks/:taskId/move')
  moveTask(@Param('taskId') taskId: string, @Body() dto: MoveTaskDto) {
    return this.taskService.moveTaskToColumn(taskId, dto.targetColumnId, dto.newOrder);
  }

  // Delete Task
  @Delete('tasks/:taskId')
  deleteTask(@Param('taskId') taskId: string) {
    return this.taskService.deleteTask(taskId);
  }

  // Unassign Member
  @Delete('tasks/:taskId/unassign/:userId')
  unassignUser(@Param('taskId') taskId: string, @Param('userId') userId: string) {
    return this.taskService.unassignMemberFromTask(taskId, userId);
  }
}
