import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { TeamValidation } from './team.validation';
import { createErrorResponse, createSuccessResponse, Error400, Error401, Error403, Error404, Error409, Error500 } from '../../utils/swaggerHelpers';

export const registerTeamSwagger = (registry: OpenAPIRegistry, bearerAuth: any) => {
  const MemberSchema = z.object({
    id: z.string().openapi({ example: 'uuid-1234' }),
    name: z.string().openapi({ example: 'John Doe' }),
    email: z.string().openapi({ example: 'john@example.com' }),
    role: z.string().openapi({ example: 'HOST' })
  });

  const TeamResponseSchema = z.object({
    id: z.string().openapi({ example: 'tm_a1b2c3d4e5f6g7h8' }),
    name: z.string().openapi({ example: 'My Travel Agency' }),
    description: z.string().nullable().openapi({ example: 'We provide the best travel services.' }),
    ownerId: z.string().openapi({ example: 'uuid-1234' }),
    owner: z.object({
      id: z.string().openapi({ example: 'uuid-1234' }),
      name: z.string().openapi({ example: 'John Doe' }),
      email: z.string().openapi({ example: 'john@example.com' })
    }),
    members: z.array(MemberSchema),
    _count: z.object({
      listings: z.number().openapi({ example: 5 })
    }),
    createdAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z' }),
    updatedAt: z.string().openapi({ example: '2023-01-01T00:00:00.000Z' })
  });

  // POST /teams
  registry.registerPath({
    method: 'post',
    path: '/api/v1/teams',
    tags: ['Teams'],
    summary: 'Create a new team',
    security: [{ [bearerAuth.name]: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: (TeamValidation.createTeam as any).shape.body
          }
        }
      }
    },
    responses: {
      201: createSuccessResponse(TeamResponseSchema, 'Team created successfully', 'Team created successfully.'),
      400: Error400,
      401: Error401,
      409: Error409,
      500: Error500
    }
  });

  // GET /teams/my-team
  registry.registerPath({
    method: 'get',
    path: '/api/v1/teams/my-team',
    tags: ['Teams'],
    summary: 'Get my team',
    security: [{ [bearerAuth.name]: [] }],
    responses: {
      200: createSuccessResponse(TeamResponseSchema, 'Your team retrieved successfully', 'Your team retrieved successfully.'),
      401: Error401,
      404: Error404,
      500: Error500
    }
  });

  // GET /teams/:id
  registry.registerPath({
    method: 'get',
    path: '/api/v1/teams/{id}',
    tags: ['Teams'],
    summary: 'Get team by ID',
    security: [{ [bearerAuth.name]: [] }],
    request: {
      params: z.object({
        id: z.string().openapi({ description: 'Team ID', example: 'tm_a1b2c3d4e5f6g7h8' })
      })
    },
    responses: {
      200: createSuccessResponse(TeamResponseSchema, 'Team retrieved successfully', 'Team retrieved successfully.'),
      401: Error401,
      404: Error404,
      500: Error500
    }
  });

  // PATCH /teams/:id
  registry.registerPath({
    method: 'patch',
    path: '/api/v1/teams/{id}',
    tags: ['Teams'],
    summary: 'Update team',
    security: [{ [bearerAuth.name]: [] }],
    request: {
      params: z.object({
        id: z.string().openapi({ description: 'Team ID', example: 'tm_a1b2c3d4e5f6g7h8' })
      }),
      body: {
        content: {
          'application/json': {
            schema: (TeamValidation.updateTeam as any).shape.body
          }
        }
      }
    },
    responses: {
      200: createSuccessResponse(TeamResponseSchema, 'Team updated successfully', 'Team updated successfully.'),
      400: Error400,
      401: Error401,
      403: Error403,
      404: Error404,
      500: Error500
    }
  });

  // POST /teams/:id/members
  registry.registerPath({
    method: 'post',
    path: '/api/v1/teams/{id}/members',
    tags: ['Teams'],
    summary: 'Add a member to the team',
    security: [{ [bearerAuth.name]: [] }],
    request: {
      params: z.object({
        id: z.string().openapi({ description: 'Team ID', example: 'tm_a1b2c3d4e5f6g7h8' })
      }),
      body: {
        content: {
          'application/json': {
            schema: (TeamValidation.addMember as any).shape.body
          }
        }
      }
    },
    responses: {
      200: createSuccessResponse(TeamResponseSchema, 'Member added successfully', 'Member added successfully.'),
      400: Error400,
      401: Error401,
      403: Error403,
      404: Error404,
      409: createErrorResponse('Conflict', 'This user is already a member of a team.'),
      500: Error500
    }
  });

  // DELETE /teams/:id/members/:userId
  registry.registerPath({
    method: 'delete',
    path: '/api/v1/teams/{id}/members/{userId}',
    tags: ['Teams'],
    summary: 'Remove a member from the team',
    security: [{ [bearerAuth.name]: [] }],
    request: {
      params: z.object({
        id: z.string().openapi({ description: 'Team ID', example: 'tm_a1b2c3d4e5f6g7h8' }),
        userId: z.string().openapi({ description: 'User ID to remove', example: 'uuid-5678' })
      })
    },
    responses: {
      200: createSuccessResponse(TeamResponseSchema, 'Member removed successfully', 'Member removed successfully.'),
      400: Error400,
      401: Error401,
      403: Error403,
      404: Error404,
      500: Error500
    }
  });
};
