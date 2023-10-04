import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    if (user.hash != dto.password)
      throw new ForbiddenException('Credentials incorrect');

    delete user.hash;

    return user;
  }

  async signup(dto: AuthDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: dto.password,
        },
      });

      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credetials taken');
        }
      }
      throw error;
    }
  }
}
