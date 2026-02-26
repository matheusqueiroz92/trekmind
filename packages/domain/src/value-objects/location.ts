import { LatLong } from "./lat-long";
import { DomainError } from "../errors/domain-error";

const DEFAULT_RADIUS_KM = 10;
const MAX_RADIUS_KM = 100;

type CoordinateBased = {
  kind: "coordinates";
  coordinates: LatLong;
  radiusKm: number;
};

type AddressBased = {
  kind: "address";
  address?: string;
  city?: string;
  country?: string;
};

type LocationProps = CoordinateBased | AddressBased;

export class Location {
  private constructor(private readonly props: LocationProps) {}

  static fromCoordinates(props: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
  }): Location {
    const coordinates = LatLong.create({
      latitude: props.latitude,
      longitude: props.longitude,
    });
    const radiusKm = props.radiusKm ?? DEFAULT_RADIUS_KM;
    if (radiusKm <= 0 || radiusKm > MAX_RADIUS_KM) {
      throw new DomainError(
        `Radius must be between 1 and ${MAX_RADIUS_KM} km`
      );
    }
    return new Location({ kind: "coordinates", coordinates, radiusKm });
  }

  static fromAddress(props: {
    address?: string;
    city?: string;
    country?: string;
  }): Location {
    const hasAny = props.address ?? props.city ?? props.country;
    if (!hasAny || (typeof hasAny === "string" && hasAny.trim().length === 0)) {
      throw new DomainError(
        "At least one of address, city or country must be provided"
      );
    }
    return new Location({
      kind: "address",
      address: props.address?.trim(),
      city: props.city?.trim(),
      country: props.country?.trim(),
    });
  }

  get latitude(): number {
    if (this.props.kind !== "coordinates") return 0;
    return this.props.coordinates.latitude;
  }

  get longitude(): number {
    if (this.props.kind !== "coordinates") return 0;
    return this.props.coordinates.longitude;
  }

  get radiusKm(): number {
    if (this.props.kind !== "coordinates") return DEFAULT_RADIUS_KM;
    return this.props.radiusKm;
  }

  get address(): string | undefined {
    if (this.props.kind !== "address") return undefined;
    return this.props.address;
  }
  get city(): string | undefined {
    if (this.props.kind !== "address") return undefined;
    return this.props.city;
  }
  get country(): string | undefined {
    if (this.props.kind !== "address") return undefined;
    return this.props.country;
  }

  isCoordinateBased(): boolean {
    return this.props.kind === "coordinates";
  }

  getCoordinates(): LatLong | null {
    if (this.props.kind === "coordinates") return this.props.coordinates;
    return null;
  }
}
