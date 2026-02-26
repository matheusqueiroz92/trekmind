import { DomainError } from "../errors/domain-error";

export type AddressProps = {
  street?: string;
  city?: string;
  region?: string;
  country: string;
  postalCode?: string;
};

export class Address {
  private constructor(private readonly props: AddressProps) {}

  static create(props: AddressProps): Address {
    if (!props.country || props.country.trim().length === 0) {
      throw new DomainError("Country is required");
    }
    return new Address({
      ...props,
      country: props.country.trim(),
      street: props.street?.trim(),
      city: props.city?.trim(),
      region: props.region?.trim(),
      postalCode: props.postalCode?.trim(),
    });
  }

  static fromString(fullAddress: string): Address {
    const trimmed = fullAddress?.trim();
    if (!trimmed || trimmed.length === 0) {
      throw new DomainError("Address string cannot be empty");
    }
    return new Address({ country: trimmed });
  }

  get street(): string | undefined {
    return this.props.street;
  }
  get city(): string | undefined {
    return this.props.city;
  }
  get region(): string | undefined {
    return this.props.region;
  }
  get country(): string {
    return this.props.country;
  }
  get postalCode(): string | undefined {
    return this.props.postalCode;
  }

  getValue(): string {
    const parts = [
      this.props.street,
      this.props.city,
      this.props.region,
      this.props.postalCode,
      this.props.country,
    ].filter(Boolean);
    return parts.join(", ");
  }
}
