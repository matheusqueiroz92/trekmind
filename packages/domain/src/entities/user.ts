import { Email } from "../value-objects/email";
import { DomainError } from "../errors/domain-error";

type UserProps = {
  id: string;
  name: string;
  email: Email;
  createdAt: Date;
};

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  public static create(props: {
    id: string;
    name: string;
    email: string;
  }): User {
    if (!props.name || props.name.length < 2) {
      throw new DomainError("Name must have at least 2 characters");
    }

    return new User({
      id: props.id,
      name: props.name,
      email: Email.create(props.email),
      createdAt: new Date(),
    });
  }

  /** Reconstitui um User a partir de dados já persistidos (ex.: banco de dados). */
  public static reconstitute(props: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }): User {
    return new User({
      id: props.id,
      name: props.name,
      email: Email.create(props.email),
      createdAt: props.createdAt,
    });
  }

  public get id() {
    return this.props.id;
  }

  public get name() {
    return this.props.name;
  }

  public get email() {
    return this.props.email.getValue();
  }

  public get createdAt() {
    return this.props.createdAt;
  }
}