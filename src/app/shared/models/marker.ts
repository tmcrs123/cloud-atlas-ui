import type { MarkerImage } from './marker-image';

export type Marker = {
  id: string;
  atlasId: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
  imageCount: number;
  title: string;
  journal?: string;
  longitude: number;
  latitude: number;
  markerPhotosLink: string;
  images: MarkerImage[];
};
