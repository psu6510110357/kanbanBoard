import { IsUUID, IsInt } from 'class-validator';

export class MoveTaskDto {
  @IsUUID()
  targetColumnId: string;

  @IsInt()
  newOrder: number;
}
