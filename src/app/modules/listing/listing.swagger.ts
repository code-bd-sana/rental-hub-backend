import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { createErrorResponse, createPaginatedResponse, createSuccessResponse, Error400, Error401, Error403, Error404, Error500 } from '../../utils/swaggerHelpers';

export const registerListingSwagger = (registry: OpenAPIRegistry, bearerAuth: any) => {
  const ListingResponseSchema = z.object({
    id: z.string().openapi({ example: 'uuid-1234' }),
    title: z.string().openapi({ example: 'Luxury Beach Villa' }),
    description: z.string().openapi({ example: 'A beautiful villa by the sea.' }),
    category: z.string().openapi({ example: 'STAYS' }),
    price: z.number().openapi({ example: 150.0 }),
    location: z.string().nullable().openapi({ example: 'Cox Bazar, Bangladesh' }),
    images: z.array(z.string()).openapi({ example: ['https://res.cloudinary.com/...'] }),
    isActive: z.boolean().openapi({ example: true }),
    attributes: z.any().nullable().openapi({ example: { bedrooms: 3, hasWifi: true } }),
    hostId: z.string().openapi({ example: 'uuid-1234' }),
    host: z.object({
      id: z.string(), name: z.string(), email: z.string()
    }),
    teamId: z.string().nullable(),
    team: z.object({ id: z.string(), name: z.string() }).nullable(),
    createdAt: z.string(),
    updatedAt: z.string()
  });

  // POST /listings
  registry.registerPath({
    method: 'post',
    path: '/api/v1/listings',
    tags: ['Listings'],
    summary: 'Create a new listing (with optional image upload)',
    description: 'Send as multipart/form-data. Put JSON in "data" field and images in "images" field.',
    security: [{ [bearerAuth.name]: [] }],
    responses: {
      201: createSuccessResponse(ListingResponseSchema, 'Listing created', 'Listing created successfully.'),
      400: Error400, 401: Error401, 500: Error500
    }
  });

  // GET /listings (public)
  registry.registerPath({
    method: 'get',
    path: '/api/v1/listings',
    tags: ['Listings'],
    summary: 'Get all listings (public, with filters)',
    request: {
      query: z.object({
        searchTerm: z.string().optional(),
        category: z.string().optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
        location: z.string().optional(),
        isActive: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.string().optional()
      })
    },
    responses: {
      200: createPaginatedResponse(ListingResponseSchema, 'Listings retrieved', 'Listings retrieved successfully.'),
      500: Error500
    }
  });

  // GET /listings/:id (public)
  registry.registerPath({
    method: 'get',
    path: '/api/v1/listings/{id}',
    tags: ['Listings'],
    summary: 'Get listing by ID (public)',
    request: {
      params: z.object({
        id: z.string().openapi({ description: 'Listing ID' })
      })
    },
    responses: {
      200: createSuccessResponse(ListingResponseSchema, 'Listing retrieved', 'Listing retrieved successfully.'),
      404: Error404, 500: Error500
    }
  });

  // GET /listings/my-listings
  registry.registerPath({
    method: 'get',
    path: '/api/v1/listings/my-listings',
    tags: ['Listings'],
    summary: 'Get my listings',
    security: [{ [bearerAuth.name]: [] }],
    responses: {
      200: createPaginatedResponse(ListingResponseSchema, 'Your listings', 'Your listings retrieved successfully.'),
      401: Error401, 500: Error500
    }
  });

  // PATCH /listings/:id
  registry.registerPath({
    method: 'patch',
    path: '/api/v1/listings/{id}',
    tags: ['Listings'],
    summary: 'Update listing (with optional image upload)',
    security: [{ [bearerAuth.name]: [] }],
    request: {
      params: z.object({ id: z.string() })
    },
    responses: {
      200: createSuccessResponse(ListingResponseSchema, 'Listing updated', 'Listing updated successfully.'),
      400: Error400, 401: Error401, 403: Error403, 404: Error404, 500: Error500
    }
  });

  // DELETE /listings/:id
  registry.registerPath({
    method: 'delete',
    path: '/api/v1/listings/{id}',
    tags: ['Listings'],
    summary: 'Delete listing',
    security: [{ [bearerAuth.name]: [] }],
    request: {
      params: z.object({ id: z.string() })
    },
    responses: {
      200: createSuccessResponse(z.null(), 'Listing deleted', 'Listing deleted successfully.'),
      401: Error401, 403: Error403, 404: Error404, 500: Error500
    }
  });

  // PATCH /listings/:id/toggle-status (Admin)
  registry.registerPath({
    method: 'patch',
    path: '/api/v1/listings/{id}/toggle-status',
    tags: ['Listings'],
    summary: 'Toggle listing active status (Admin only)',
    security: [{ [bearerAuth.name]: [] }],
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: z.object({
              isActive: z.boolean().openapi({ example: false })
            })
          }
        }
      }
    },
    responses: {
      200: createSuccessResponse(ListingResponseSchema, 'Status toggled', 'Listing status updated.'),
      401: Error401, 403: Error403, 404: Error404, 500: Error500
    }
  });
};
