import { randomUUID } from "crypto";
import { User } from "@trekmind/domain";
import { UserRepository } from "./repositories/user-repository";

interface CreateUserRequest {
  name: string;
  email: string;
}

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ name, email }: CreateUserRequest) {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("User already exists.");
    }

    const user = User.create({ id: randomUUID(), name, email });

    await this.userRepository.save(user);

    return user;
  }
}