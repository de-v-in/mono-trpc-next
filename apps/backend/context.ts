import { MikroORMInstance } from "@/services/mikro-orm";
import { verify } from "jsonwebtoken";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { User } from "@repo/orm-entities/user";
import { BackendENV } from "@repo/env";
import { Logger } from "@saintno/needed-tools";

const ContextLogger = new Logger("Context");

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export const createContext = async (opts: CreateNextContextOptions) => {
  const orm = await MikroORMInstance.getInstance().getORM();
  const headers = opts.req.headers;
  const rawAuthorization =
    headers["authorization"] ?? opts.info?.connectionParams?.Authorization;
  const accessToken = rawAuthorization?.replace("Bearer ", "");

  // Log user request to terminal
  ContextLogger.i("createContext", opts.req.method || "GET", opts.req.url);

  const em = orm.em.fork();
  try {
    let user: User | null = null;
    if (accessToken) {
      const tokenInfo = verify(accessToken, BackendENV.NEXTAUTH_SECRET) as {
        email: string;
      };
      user = await em.findOne(User, { email: tokenInfo.email });
    }
    return {
      session: { user },
      em,
      headers,
    };
  } catch (e) {
    throw new Error("Invalid access token");
  }
};

export type Context = Awaited<ReturnType<typeof createContext>>;
