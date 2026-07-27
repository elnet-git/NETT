import { prisma } from "../../../infrastructure/database/prisma.client";
import { passwordService } from "../../../security/auth/password.service";
import { jwtService } from "../../../security/auth/jwt.service";


interface LoginData {
  email: string;
  password: string;
}


class LoginService {

  async login(data: LoginData) {

    const user =
      await prisma.user.findUnique({
        where: {
          email: data.email,
        },
        include: {
          role: true,
        },
      });


    if (!user) {
      throw new Error(
        "Credenciales incorrectas"
      );
    }


    const passwordValid =
      await passwordService.compare(
        data.password,
        user.passwordHash
      );


    if (!passwordValid) {
      throw new Error(
        "Credenciales incorrectas"
      );
    }


    if (user.status !== "ACTIVE") {
      throw new Error(
        "Usuario no activo"
      );
    }


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


export const loginService =
  new LoginService();