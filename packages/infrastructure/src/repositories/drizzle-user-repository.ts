import { eq } from "drizzle-orm";
import { User } from "@trekmind/domain";
import { UserRepository } from "@trekmind/application";
import { db } from "../database/client";
import { users } from "../database/schema";

export class DrizzleUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email));

    if (!result.length) return null;

    const data = result[0];

    return User.reconstitute({
      id: data.id,
      name: data.name,
      email: data.email,
      createdAt: data.createdAt,
    });
  }

  async save(user: User): Promise<void> {
    await db.insert(users).values({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  }
}