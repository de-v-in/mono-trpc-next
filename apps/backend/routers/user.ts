import { z } from "zod";
import { router } from "../trpc";
import { User } from "@repo/orm-entities/user";
import { privateProcedure, publicProcedure } from "@/procedure";

export const userRouter = router({
  hello: publicProcedure.query(() => "Hello, world!"),
  userUpdate: privateProcedure
    .input(
      z.object({
        avatarId: z.string().optional(),
        password: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user!;
      if (input.password !== undefined && input.password.length >= 8)
        user.password = User.hashPassword(input.password);
      await ctx.em.persistAndFlush(user);
      return true;
    }),
  delete: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.em.findOneOrFail(User, input.id);
      await ctx.em.remove(user).flush();
      return true;
    }),
});
