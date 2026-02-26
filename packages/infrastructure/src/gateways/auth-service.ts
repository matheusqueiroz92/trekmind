import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "trekmind-dev-secret-change-in-production"
);

export interface JwtPayload {
  userId: string;
  email: string;
  exp?: number;
  iat?: number;
}

export class JwtTokenService {
  async sign(payload: { userId: string; email: string }): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);
  }

  async verify(token: string): Promise<JwtPayload> {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    const email = payload.email as string;
    if (!userId || !email) {
      throw new Error("Invalid token payload");
    }
    return {
      userId,
      email,
      exp: payload.exp,
      iat: payload.iat,
    };
  }
}
