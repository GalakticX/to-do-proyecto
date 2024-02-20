import { db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
const mainRouter = createTRPCRouter({
  getTasksByUserId: protectedProcedure.query(async ({ ctx }) => {
    try {
      const tasksTableQuery = await db.tasks.findMany({
        where: { user_id_that_created: ctx.session.user.id },
      });

      if (!tasksTableQuery) {
        return false;
      }

      return tasksTableQuery;
    } catch (error) {
      throw new Error("Internal Server Error");
    }
  }),

  createNewTask: protectedProcedure
    .input(z.object({ title: z.string(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db.tasks.create({
          data: {
            user_id_that_created: ctx.session.user.id,
            title: input.title,
            description: input.description,
          },
        });
        return true;
      } catch (error) {
        throw new Error("Internal Server Error");
      }
    }),
});

export default mainRouter;
