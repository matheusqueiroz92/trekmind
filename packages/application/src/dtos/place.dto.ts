export interface PlaceDTO {
  id: string;
  name: string;
  description?: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  source?: string;
  createdAt: Date;
}
