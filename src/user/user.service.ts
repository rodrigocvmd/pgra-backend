import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.user.findMany();
  }

  async findOne(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const newUser = await this.prismaService.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash,
        role: createUserDto.role,
      },
    });
    return newUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const dataToUpdate: any = { ...updateUserDto };

    if (updateUserDto.password) {
      dataToUpdate.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete dataToUpdate.password;
    }
    return this.prismaService.user.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string) {
    return await this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }
}
