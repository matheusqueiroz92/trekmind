import { User } from "@trekmind/domain";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User, options?: { passwordHash: string }): Promise<void>;
  getPasswordHash(email: string): Promise<string | null>;
}