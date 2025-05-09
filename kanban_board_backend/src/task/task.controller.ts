import { Controller, Post, Body, Param, UseGuards, Put, Delete, Get } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { TaskOrderDto } from './dto/order-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // Create Task
  @Post('columns/:columnId/tasks')
  createTask(@Param('columnId') columnId: string, @Body() dto: CreateTaskDto) {
    return this.taskService.createTask(columnId, dto.title);
  }

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

  // Delete Task
  @Delete('tasks/:taskId')
  deleteTask(@Param('taskId') taskId: string) {
    return this.taskService.deleteTask(taskId);
  }
}
