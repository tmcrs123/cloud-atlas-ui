import { Image } from './image';

export type Marker = {
  markerId: string;
  mapId: string;
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
  images: Image[];
};
