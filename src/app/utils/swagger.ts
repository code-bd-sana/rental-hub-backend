import { OpenApiGeneratorV3, OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { registerAuthSwagger } from '../modules/auth/auth.swagger';
import { registerListingSwagger } from '../modules/listing/listing.swagger';
import { registerTeamSwagger } from '../modules/team/team.swagger';
import { registerUserSwagger } from '../modules/user/user.swagger';

// Extend Zod to support OpenAPI
extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// Register Bearer Auth
const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT'
});

// Register Module Routes
registerAuthSwagger(registry, bearerAuth);
registerUserSwagger(registry, bearerAuth);
registerTeamSwagger(registry, bearerAuth);
registerListingSwagger(registry, bearerAuth);

export const generateSwaggerDocs = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Rentals Hub N.V. API',
      description: 'API Documentation for Rentals Hub N.V. — Multi-Service Booking Marketplace.'
    },
    servers: [{ url: '/' }]
  });
};
