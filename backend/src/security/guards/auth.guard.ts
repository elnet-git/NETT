import { Request, Response, NextFunction } from "express";
import { jwtService } from "../auth/jwt.service";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export function authGuard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  console.log("\n========== AUTH GUARD ==========");

  try {
    const authorization = req.headers.authorization;

    console.log("Authorization Header:");
    console.log(authorization);

    if (!authorization) {
      console.log("❌ No existe Authorization");

      return res.status(401).json({
        message: "Token requerido",
      });
    }

    const token = authorization
      .replace(/^Bearer\s+/i, "")
      .trim();

    console.log("TOKEN LIMPIO:");
    console.log(token);

    console.log("Llamando verifyAccessToken()...");

    const payload = jwtService.verifyAccessToken(token);

    console.log("Payload recibido:");
    console.log(payload);

    req.user = payload;

    console.log("req.user:");
    console.log(req.user);

    console.log("Ejecutando next()");

    next();

    console.log("next() terminó");
  } catch (error: any) {
    console.log("JWT ERROR:");
    console.log(error);

    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
}