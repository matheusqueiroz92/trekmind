import { describe, it, expect } from "vitest";
import { User } from "../entities/user";

describe("User Entity", () => {
  it("should create a valid user", () => {
    const user = User.create({
      id: "1",
      name: "Matheus",
      email: "matheus@email.com",
    });

    expect(user.name).toBe("Matheus");
    expect(user.email).toBe("matheus@email.com");
  });

  it("should not allow invalid email", () => {
    expect(() =>
      User.create({
        id: "1",
        name: "Matheus",
        email: "invalid-email",
      })
    ).toThrow();
  });

  it("should not allow short name", () => {
    expect(() =>
      User.create({
        id: "1",
        name: "A",
        email: "test@email.com",
      })
    ).toThrow();
  });
});