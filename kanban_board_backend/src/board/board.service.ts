import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.prisma.board.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.board.delete({
      where: { id },
    });
  }
}
