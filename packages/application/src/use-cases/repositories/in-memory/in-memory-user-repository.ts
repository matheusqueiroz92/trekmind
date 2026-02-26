import { User } from "@trekmind/domain";
import { UserRepository } from "../user-repository";

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];
  private passwordHashes = new Map<string, string>();

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async save(user: User, options?: { passwordHash: string }): Promise<void> {
    this.users.push(user);
    if (options?.passwordHash) {
      this.passwordHashes.set(user.email, options.passwordHash);
    }
  }

  async getPasswordHash(email: string): Promise<string | null> {
    return this.passwordHashes.get(email) ?? null;
  }
}
