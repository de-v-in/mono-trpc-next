import swagger from '@elysiajs/swagger';
import Elysia from 'elysia';

import { UserPlugin } from './handlers/user';
import { EnsureLogPlugin } from './plugins/ensure-log-plugin';

export const ElysiaHandler = new Elysia()
  .use(EnsureLogPlugin)
  .decorate(() => {
    return {
      start: performance.now(),
    };
  })
  .onAfterResponse(({ log, start, request }) => {
    log.i(request.method, request.url, {
      time: Math.round((performance.now() - start) / 1000) + 'ms',
    });
  })
  // Bind Swagger to Elysia
  .use(
    swagger({
      documentation: {
        info: {
          title: 'API Document | ComfyUI-Station',
          version: '1.0.0',
        },
        tags: [
          { name: 'Others', description: 'Other app api' },
          { name: 'Workflow', description: 'Workflow apis' },
          { name: 'Task', description: 'Task apis' },
          { name: 'Attachment', description: 'Attachment apis' },
        ],
        components: {
          securitySchemes: {
            // Support bearer token
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    })
  )
  // User authentication
  .use(UserPlugin)
  // Bind Internal Path
  .use(
    new Elysia({ prefix: '/api/ext' })
      .get(
        '/health',
        () => {
          return {
            status: 'ok',
          };
        },
        {
          detail: {
            tags: ['Others'],
          },
        }
      )
      .guard(
        {
          detail: { security: [{ BearerAuth: [] }] },
        },
        // Bind handlers
        (app) => app
      )
  );
