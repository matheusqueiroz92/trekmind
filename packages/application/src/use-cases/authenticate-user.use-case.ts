import type { UserRepository } from "./repositories/user-repository";

export interface TokenService {
  sign(payload: { userId: string; email: string }): Promise<string>;
}

export interface AuthenticateUserRequest {
  email: string;
  password: string;
}

export interface AuthenticateUserResult {
  token: string;
  user: { id: string; name: string; email: string };
}

export class AuthenticateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService,
    private comparePassword: (plain: string, hash: string) => Promise<boolean>
  ) {}

  async execute(
    request: AuthenticateUserRequest
  ): Promise<AuthenticateUserResult> {
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const hash = await this.userRepository.getPasswordHash(request.email);
    if (!hash) {
      throw new Error("Invalid email or password.");
    }

    const valid = await this.comparePassword(request.password, hash);
    if (!valid) {
      throw new Error("Invalid email or password.");
    }

    const token = await this.tokenService.sign({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
