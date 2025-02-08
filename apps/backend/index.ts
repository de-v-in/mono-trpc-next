import { createServer, IncomingMessage, ServerResponse } from 'node:http';

import { MikroORMInstance } from '@backend/services/mikro-orm';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import cors from 'cors';
import type { Socket } from 'net';
import { WebSocketServer } from 'ws';

import { createContext } from './context';
import { ElysiaHandler } from './elysia.route';
import { appRouter } from './routers/_app';
import { createPrefixedHandler } from './utils/handler';
import { convertIMessToRequest } from './utils/request';

/**
 * Initialize all services
 */
MikroORMInstance.getInstance();

export const tRPCHandler = createHTTPHandler({
  middleware: cors(),
  router: appRouter,
  createContext: createContext as any,
});
const prefixedTRPCHandler = createPrefixedHandler('/api/trpc', tRPCHandler);

const handleElysia = async (req: IncomingMessage, res: ServerResponse) => {
  const request = await convertIMessToRequest(req);
  const output = await ElysiaHandler.handle(request);
  // If the response is 404, then passthrough request to tRPC's handler
  if (output.status !== 404) {
    res.writeHead(output.status, {
      'Content-Type': output.headers.get('content-type') ?? 'application/json',
    });
    const contentType = output.headers.get('content-type') ?? 'application/json';
    res.writeHead(output.status, { 'Content-Type': contentType });

    if (contentType.startsWith('text/') || contentType === 'application/json') {
      const data = await output.text();
      res.write(data);
    } else {
      const data = await output.arrayBuffer();
      res.write(Buffer.from(data));
    }

    res.end();
    return true;
  }
  return false;
};

const server = createServer(async (req, res) => {
  try {
    /**
     * Handle the request using Elysia
     */
    if (
      req.url?.startsWith('/swagger') ||
      req.url?.startsWith('/api/user') ||
      req.url?.startsWith('/api/ext')
    ) {
      const handled = await handleElysia(req, res);
      if (handled) {
        return;
      }
    }
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.end();
  }
  /**
   * Handle the request using tRPC
   */
  prefixedTRPCHandler(req, res);
});

const wss = new WebSocketServer({ server });
const handlerWs = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: createContext as any,
  keepAlive: {
    enabled: true,
    pingMs: 30000,
    pongWaitMs: 5000,
  },
});

process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handlerWs.broadcastReconnectNotification();
});

server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket as Socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

const originalOn = server.on.bind(server);
server.on = function (event, listener) {
  return event !== 'upgrade' ? originalOn(event, listener) : server;
};

/**
 * Start the server
 */
server.listen(3001, '0.0.0.0');
