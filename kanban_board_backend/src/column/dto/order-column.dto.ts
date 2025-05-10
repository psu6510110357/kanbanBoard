import { IsDefined, IsUUID } from 'class-validator';

export class ColumnOrderDto {
  @IsDefined()
  @IsUUID()
  columnId: string;
}
