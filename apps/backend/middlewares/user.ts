import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";

export const authChecker = middleware(({ next, ctx }) => {
  const user = ctx.session;

  if (!user?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next();
});
