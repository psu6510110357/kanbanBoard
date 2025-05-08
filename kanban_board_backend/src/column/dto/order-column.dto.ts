import { IsString, IsNumber } from 'class-validator';

export class ColumnOrderDto {
  @IsString()
  columnId: string;

  @IsNumber()
  newOrder: number;
}
