import type { Marker } from './marker.js';

export type Atlas = {
  atlasId: string;
  owner?: string;
  coverPhoto?: string;
  createdAt: string;
  updatedAt?: string;
  markersCount: number;
  title: string;
  claims: 'EDIT' | 'OWN' | 'VIEW';
  markers: Marker[];
};
