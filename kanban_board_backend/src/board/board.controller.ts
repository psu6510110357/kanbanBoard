import { Controller, Get, Post, Body, Param, Delete, Put, Req, UseGuards } from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { AuthRequest } from 'src/interface/jwtRequest';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AddBoardMemberDto } from './dto/add-board-member.dto';
import { ColumnService } from 'src/column/column.service';
import { CreateColumnDto } from 'src/column/dto/create-column.dto';
import { UpdateColumnDto } from 'src/column/dto/update-column.dto';
import { ColumnOrderDto } from 'src/column/dto/order-column.dto';

@UseGuards(JwtAuthGuard)
@Controller('board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly columnService: ColumnService,
  ) {}

  //Board Management
  @Post()
  create(@Body() dto: CreateBoardDto, @Req() req: AuthRequest) {
    return this.boardService.create(dto, req.user.userId);
  }

  @Post(':id/members')
  addMember(@Param('id') boardId: string, @Body() dto: AddBoardMemberDto) {
    return this.boardService.addMember(boardId, dto.userId);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.boardService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBoardDto) {
    return this.boardService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardService.remove(id);
  }

  // Column Management
  @Post(':boardId/columns')
  createColumn(@Param('boardId') boardId: string, @Body() dto: CreateColumnDto) {
    return this.columnService.createColumn(boardId, dto.name);
  }

  @Get(':boardId/columns')
  getColumns(@Param('boardId') boardId: string) {
    return this.columnService.getColumns(boardId);
  }

  @Put('columns/:columnId')
  updateNameColumn(@Param('columnId') columnId: string, @Body() dto: UpdateColumnDto) {
    return this.columnService.updateNameColumn(columnId, dto.name);
  }

  @Put(':boardId/columns/reorder')
  reorderColumns(@Param('boardId') boardId: string, @Body() columnOrder: ColumnOrderDto[]) {
    return this.columnService.reorderColumns(boardId, columnOrder);
  }

  @Delete('columns/:columnId')
  deleteColumn(@Param('columnId') columnId: string) {
    return this.columnService.deleteColumn(columnId);
  }
}
