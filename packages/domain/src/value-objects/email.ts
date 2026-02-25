import { DomainError } from "../errors/domain-error";

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(email: string): Email {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      throw new DomainError("Invalid email format");
    }

    return new Email(email.toLowerCase());
  }

  public getValue(): string {
    return this.value;
  }
}