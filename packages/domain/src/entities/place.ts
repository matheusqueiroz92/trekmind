import { LatLong } from "../value-objects/lat-long";
import { PlaceCategory } from "../value-objects/place-category";
import { Address } from "../value-objects/address";
import { DomainError } from "../errors/domain-error";

export type PlaceSource = "wikipedia" | "google";

type PlaceProps = {
  id: string;
  name: string;
  description?: string;
  category: PlaceCategory;
  coordinates: LatLong;
  address?: Address;
  source?: PlaceSource;
  createdAt: Date;
};

export class Place {
  private constructor(private readonly props: PlaceProps) {}

  static create(props: {
    id: string;
    name: string;
    description?: string;
    category: string;
    latitude: number;
    longitude: number;
    address?: string;
    source?: PlaceSource;
  }): Place {
    const name = props.name?.trim();
    if (!name || name.length === 0) {
      throw new DomainError("Place name cannot be empty");
    }

    const coordinates = LatLong.create({
      latitude: props.latitude,
      longitude: props.longitude,
    });
    const category = PlaceCategory.create(props.category);
    const address = props.address?.trim()
      ? Address.fromString(props.address)
      : undefined;

    return new Place({
      id: props.id,
      name,
      description: props.description?.trim(),
      category,
      coordinates,
      address,
      source: props.source,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: {
    id: string;
    name: string;
    description?: string;
    category: string;
    latitude: number;
    longitude: number;
    address?: string;
    source?: PlaceSource;
    createdAt: Date;
  }): Place {
    const coordinates = LatLong.create({
      latitude: props.latitude,
      longitude: props.longitude,
    });
    const category = PlaceCategory.create(props.category);
    const address = props.address?.trim()
      ? Address.fromString(props.address)
      : undefined;

    return new Place({
      id: props.id,
      name: props.name,
      description: props.description,
      category,
      coordinates,
      address,
      source: props.source,
      createdAt: props.createdAt,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string | undefined {
    return this.props.description;
  }
  get category(): PlaceCategory {
    return this.props.category;
  }
  get coordinates(): LatLong {
    return this.props.coordinates;
  }
  get address(): Address | undefined {
    return this.props.address;
  }
  get source(): PlaceSource | undefined {
    return this.props.source;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}
