import { Controller, Get, Post, Body, Param, Delete, Put, Req, UseGuards } from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AddBoardMemberDto } from './dto/add-board-member.dto';
import { ColumnService } from 'src/column/column.service';
import { CreateColumnDto } from 'src/column/dto/create-column.dto';
import { UpdateColumnDto } from 'src/column/dto/update-column.dto';
import { ColumnOrderDto } from 'src/column/dto/order-column.dto';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { BoardOwnerGuard } from 'src/common/guards/board-owner.guard';
import { BoardAccessGuard } from 'src/common/guards/board-access.guard';

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

  @UseGuards(BoardOwnerGuard)
  @Post(':boardId/members')
  addMember(@Param('boardId') boardId: string, @Body() dto: AddBoardMemberDto) {
    return this.boardService.addMember(boardId, dto.userId);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.boardService.findAllByUser(req.user.userId);
  }

  @UseGuards(BoardAccessGuard)
  @Get(':boardId/initial')
  getInitialBoard(@Param('boardId') boardId: string) {
    return this.boardService.findInitialBoardByBoardId(boardId);
  }

  @UseGuards(BoardAccessGuard)
  @Get(':boardId')
  findOne(@Param('boardId') boardId: string) {
    return this.boardService.findOne(boardId);
  }

  @UseGuards(BoardOwnerGuard)
  @Put(':boardId')
  updateTitle(@Param('boardId') boardId: string, @Body() dto: UpdateBoardDto) {
    return this.boardService.updateTitle(boardId, dto);
  }

  @UseGuards(BoardOwnerGuard)
  @Delete(':boardId')
  remove(@Param('boardId') boardId: string) {
    return this.boardService.remove(boardId);
  }

  @UseGuards(BoardAccessGuard)
  @Post(':boardId/columns')
  createColumn(@Param('boardId') boardId: string, @Body() dto: CreateColumnDto) {
    return this.columnService.createColumn(boardId, dto.name);
  }

  @UseGuards(BoardAccessGuard)
  @Get(':boardId/columns')
  getColumns(@Param('boardId') boardId: string) {
    return this.columnService.getColumns(boardId);
  }

  @UseGuards(BoardAccessGuard)
  @Put('columns/:columnId')
  updateNameColumn(@Param('columnId') columnId: string, @Body() dto: UpdateColumnDto) {
    return this.columnService.updateNameColumn(columnId, dto.name);
  }

  @UseGuards(BoardAccessGuard)
  @Put(':boardId/columns/reorder')
  reorderColumns(@Param('boardId') boardId: string, @Body() columnOrder: ColumnOrderDto[]) {
    return this.columnService.reorderColumns(boardId, columnOrder);
  }

  @UseGuards(BoardAccessGuard)
  @Delete('columns/:columnId')
  deleteColumn(@Param('columnId') columnId: string) {
    return this.columnService.deleteColumn(columnId);
  }
}
