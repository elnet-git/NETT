import { prisma } from "../../../infrastructure/database/prisma.client";
import { passwordService } from "../../../security/auth/password.service";
import { jwtService } from "../../../security/auth/jwt.service";


interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "CLIENT" | "DRIVER" | "STORE";
}


class AuthService {

  async register(data: RegisterData) {

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });


    if (existingUser) {
      throw new Error(
        "El usuario ya existe"
      );
    }


    const role =
      await prisma.role.findUnique({
        where: {
          name: data.role,
        },
      });


    if (!role) {
      throw new Error(
        "Rol no encontrado"
      );
    }


    const passwordHash =
      await passwordService.hash(
        data.password
      );


    const user =
      await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          passwordHash,
          roleId: role.id,
        },
        include: {
          role: true,
        },
      });


    const accessToken =
      jwtService.generateAccessToken({
        userId: user.id,
        role: user.role.name,
      });


    const refreshToken =
      jwtService.generateRefreshToken({
        userId: user.id,
        role: user.role.name,
      });


    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt:
          new Date(
            Date.now() +
            30 * 24 * 60 * 60 * 1000
          ),
      },
    });


    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}


export const authService =
  new AuthService();