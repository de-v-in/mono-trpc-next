import type { AppRouter } from '@backend/routers/_app';
import { BackendENV } from '@repo/env';
import {
  createWSClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
  wsLink,
} from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import { ssrPrepass } from '@trpc/next/ssrPrepass';
import superjson from 'superjson';

let AuthToken = '';

export function setAuthToken(newToken: string) {
  /**
   * You can also save the token to cookies, and initialize from
   * cookies above.
   */
  AuthToken = newToken;
  wsClient.reconnect(null);
}

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Get html tag
    const html = document.querySelector('html');
    const isSameDomain = html?.getAttribute('data-backend-same-domain') === 'true';
    if (isSameDomain) {
      return window.location.origin;
    } else {
      return html?.getAttribute('data-backend-url') ?? BackendENV.BACKEND_URL;
    }
  }
  return BackendENV.BACKEND_URL_INTERNAL;
}

function getBaseWsUrl() {
  const BackendURL = getBaseUrl();
  if (BackendURL.includes('https')) {
    return BackendURL.replace('https', 'wss');
  }
  return BackendURL.replace('http', 'ws');
}

const wsClient = createWSClient({
  url: `${getBaseWsUrl()}/api/trpc`,
  connectionParams() {
    return {
      Authorization: `Bearer ${AuthToken}`,
    };
  },
});

const trpc = createTRPCNext<AppRouter>({
  transformer: superjson,
  config(opts) {
    const { ctx } = opts;
    if (typeof window !== 'undefined') {
      // during client requests
      return {
        links: [
          // loggerLink({
          //   enabled: (opts) =>
          //     process.env.NODE_ENV === 'development' || (opts.direction === 'down' && opts.result instanceof Error)
          // }),
          splitLink({
            condition: (op) => op.type === 'subscription',
            true: wsLink({
              client: wsClient,
              transformer: superjson,
            }),
            /**
             * Add support for file uploads
             */
            false: splitLink({
              condition: (op) => isNonJsonSerializable(op.input),
              true: httpLink({
                url: getBaseUrl() + '/api/trpc',
                transformer: {
                  serialize: (data) => data as FormData,
                  deserialize: superjson.deserialize,
                },
                async headers() {
                  return {
                    authorization: `Bearer ${AuthToken}`,
                  };
                },
              }),
              false: httpBatchLink({
                url: getBaseUrl() + '/api/trpc',
                transformer: superjson,
                async headers() {
                  return {
                    authorization: `Bearer ${AuthToken}`,
                  };
                },
              }),
            }),
          }),
        ],
      };
    }
    return {
      headers() {
        return {
          cookie: ctx?.req?.headers.cookie,
        };
      },
      links: [
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/v11/ssr
           **/
          url: `${getBaseUrl()}/api/trpc`,
          // You can pass any HTTP headers you wish here
          async headers() {
            if (!ctx?.req?.headers) {
              return {};
            }
            // To use SSR properly, you need to forward client headers to the server
            // This is so you can pass through things like cookies when we're server-side rendering
            return {
              cookie: ctx.req.headers.cookie,
            };
          },
          transformer: superjson,
        }),
      ],
    };
  },
  /**
   * @link https://trpc.io/docs/v11/ssr
   **/
  ssr: true,
  ssrPrepass,
});

export { trpc, wsClient };
