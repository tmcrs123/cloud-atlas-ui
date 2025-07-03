import type { MarkerImage } from './marker-image';

export type Marker = {
  markerId: string;
  atlasId: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
  imageCount: number;
  title: string;
  journal?: string;
  coordinates: {
    lng: number;
    lat: number;
  };
  images: MarkerImage[];
};
