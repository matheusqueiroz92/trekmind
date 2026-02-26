import { DomainError } from "../errors/domain-error";

export class LatLong {
  private constructor(
    public readonly latitude: number,
    public readonly longitude: number
  ) {}

  static create(props: { latitude: number; longitude: number }): LatLong {
    const { latitude, longitude } = props;
    if (latitude < -90 || latitude > 90) {
      throw new DomainError("Latitude must be between -90 and 90");
    }
    if (longitude < -180 || longitude > 180) {
      throw new DomainError("Longitude must be between -180 and 180");
    }
    return new LatLong(latitude, longitude);
  }

  get value(): { latitude: number; longitude: number } {
    return { latitude: this.latitude, longitude: this.longitude };
  }
}
