import { IsUUID, IsInt, IsPositive } from 'class-validator';

export class MoveTaskDto {
  @IsUUID()
  targetColumnId: string;

  @IsInt()
  @IsPositive()
  newOrder: number;
}
