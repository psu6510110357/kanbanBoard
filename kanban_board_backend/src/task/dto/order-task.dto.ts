import { IsUUID } from 'class-validator';

export class TaskOrderDto {
  @IsUUID()
  taskId: string;
}
