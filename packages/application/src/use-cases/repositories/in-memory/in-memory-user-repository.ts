import { User } from "@trekmind/domain";
import { UserRepository } from "../user-repository";

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }
}