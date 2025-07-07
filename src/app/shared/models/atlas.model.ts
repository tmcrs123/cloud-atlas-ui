import type { Marker } from './marker';

export type Atlas = {
  id: string;
  owner?: string;
  coverPhoto?: string;
  createdAt: string;
  updatedAt?: string;
  markersCount: number;
  title: string;
  claims: 'EDIT' | 'OWN' | 'VIEW';
  markers: Marker[];
};
