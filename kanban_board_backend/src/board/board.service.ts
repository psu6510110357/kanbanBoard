import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBoardDto, ownerId: string) {
    return this.prisma.board.create({
      data: {
        title: dto.title,
        ownerId,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        owner: true,
        members: {
          include: { user: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        owner: true,
        members: {
          include: { user: true },
        },
        columns: true,
      },
    });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async update(id: string, dto: UpdateBoardDto) {
    try {
      const updatedBoard = await this.prisma.board.update({
        where: { id },
        data: dto,
      });
      return updatedBoard;
    } catch (error) {
      throw new Error(`Board with ID ${id} not found.` + error);
    }
  }

  async remove(id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
    });

    if (!board) {
      throw new Error(`Board with ID ${id} not found.`);
    }

    // Log the deletion message
    console.log(`Board titled "${board.title}" was deleted`);

    return this.prisma.board.delete({
      where: { id },
    });
  }

  async addMember(boardId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // check for duplicate
    const exists = await this.prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId,
        },
      },
    });

    if (exists) throw new ConflictException('User is already a board member');

    return this.prisma.boardMember.create({
      data: {
        boardId,
        userId,
      },
    });
  }
}
