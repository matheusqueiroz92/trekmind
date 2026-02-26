import { randomUUID } from "crypto";
import { User } from "@trekmind/domain";
import { UserRepository } from "./repositories/user-repository";

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
}

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashPassword?: (password: string) => Promise<string>
  ) {}

  async execute({ name, email, password }: CreateUserRequest) {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("User already exists.");
    }

    const user = User.create({ id: randomUUID(), name, email });

    const passwordHash =
      password && this.hashPassword
        ? await this.hashPassword(password)
        : undefined;

    await this.userRepository.save(user, passwordHash ? { passwordHash } : undefined);

    return user;
  }
}