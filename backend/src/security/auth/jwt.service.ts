import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  role: string;
}

class JwtService {
  private readonly accessSecret =
    process.env.JWT_ACCESS_SECRET || "nett_access_secret";

  private readonly refreshSecret =
    process.env.JWT_REFRESH_SECRET || "nett_refresh_secret";

  private readonly accessExpires = "15m";

  private readonly refreshExpires = "30d";


  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      this.accessSecret,
      {
        expiresIn: this.accessExpires,
      }
    );
  }


  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      this.refreshSecret,
      {
        expiresIn: this.refreshExpires,
      }
    );
  }


  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(
      token,
      this.accessSecret
    ) as TokenPayload;
  }


  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(
      token,
      this.refreshSecret
    ) as TokenPayload;
  }
}

export const jwtService = new JwtService();