import type { ListingCategory } from '@prisma/client';

export interface ICreateListingPayload {
  title: string;
  description: string;
  category: ListingCategory;
  price: number;
  location?: string;
  attributes?: Record<string, unknown>;
  teamId?: string;
}

export interface IUpdateListingPayload {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  attributes?: Record<string, unknown>;
  isActive?: boolean;
}

export interface IListingQuery {
  searchTerm?: string;
  category?: ListingCategory;
  minPrice?: string;
  maxPrice?: string;
  location?: string;
  isActive?: string;
  hostId?: string;
  teamId?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}
