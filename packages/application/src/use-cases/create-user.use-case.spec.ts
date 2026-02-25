import { describe, it, expect } from "vitest";
import { CreateUserUseCase } from "./create-user.use-case";
import { InMemoryUserRepository } from "./repositories/in-memory/in-memory-user-repository"

describe("CreateUserUseCase", () => {
  it("should create a new user", async () => {
    const repository = new InMemoryUserRepository();
    const sut = new CreateUserUseCase(repository);

    const user = await sut.execute({
      name: "Matheus",
      email: "matheus@email.com",
    });

    expect(user.email).toBe("matheus@email.com");
  });

  it("should not allow duplicate emails", async () => {
    const repository = new InMemoryUserRepository();
    const sut = new CreateUserUseCase(repository);

    await sut.execute({
      name: "Matheus",
      email: "matheus@email.com",
    });

    await expect(
      sut.execute({
        name: "Outro",
        email: "matheus@email.com",
      })
    ).rejects.toThrow();
  });
});