import type { Application } from 'express';

interface RouteInfo {
  method: string;
  path: string;
}

const getRoutes = (app: Application): RouteInfo[] => {
  const routes: RouteInfo[] = [];

  // Express v5 uses `app.router`, Express v4 uses `app._router`
  const router = (app as any).router || (app as any)._router;

  if (!router?.stack) {
    return routes;
  }

  const extractRoutes = (stack: any[], basePath: string = '') => {
    for (const layer of stack) {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods);
        for (const method of methods) {
          routes.push({
            method: method.toUpperCase(),
            path: basePath + (layer.route.path === '/' && basePath ? '' : layer.route.path)
          });
        }
      } else if (layer.handle?.stack) {
        // Nested router — extract the mount path from regexp
        let mountPath = '';

        if (layer.path) {
          mountPath = layer.path;
        } else if (layer.regexp) {
          const regexpStr = layer.regexp.toString();
          const match = regexpStr.match(/^\/\^(\\\/[^?]*?)(?:\\\/)?\?\(\?=\\\/\|\$\)\/i?$/);
          if (match) {
            mountPath = match[1].replace(/\\\//g, '/');
          }
        }

        extractRoutes(layer.handle.stack, basePath + mountPath);
      }
    }
  };

  extractRoutes(router.stack);
  return routes;
};

// Color codes for HTTP methods
const methodColors: Record<string, string> = {
  GET: '\x1b[32m',    // Green
  POST: '\x1b[33m',   // Yellow
  PATCH: '\x1b[36m',  // Cyan
  PUT: '\x1b[34m',    // Blue
  DELETE: '\x1b[31m', // Red
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

export const printRoutes = (app: Application): void => {
  const routes = getRoutes(app);

  if (routes.length === 0) {
    return;
  }

  console.log('');
  console.log(`${BOLD}  Mapped Routes:${RESET}`);
  console.log(`${DIM}  ${'─'.repeat(50)}${RESET}`);

  for (const route of routes) {
    const color = methodColors[route.method] || RESET;
    const paddedMethod = route.method.padEnd(7);
    console.log(`  ${color}${paddedMethod}${RESET} ${route.path}`);
  }

  console.log(`${DIM}  ${'─'.repeat(50)}${RESET}`);
  console.log(`  ${DIM}Total: ${routes.length} routes${RESET}`);
  console.log('');
};
