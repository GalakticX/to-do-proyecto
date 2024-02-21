import { db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { DevBundlerService } from "next/dist/server/lib/dev-bundler-service";
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

  deleteTaskById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db.tasks.delete({ where: { id: input.id } });

        return true;
      } catch (error) {
        throw new Error("Internal Server Error");
      }
    }),

  completeTaskById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db.tasks.update({
          where: { id: input.id },
          data: { completed: true },
        });
        return true;
      } catch (error) {
        throw new Error("Internal Server Error");
      }
    }),

  uncompleteTaskById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db.tasks.update({
          where: { id: input.id },
          data: { completed: false },
        });
      } catch (error) {
        throw new Error("Internal Server Error");
      }
    }),

  getSharedTasksForUserId: protectedProcedure.query(async ({ ctx }) => {
    try {
      const sharedTasks = await db.shared_Tasks.findMany({
        where: { shared_with_user_id: ctx.session.user.id },
      });

      const taskIds = sharedTasks.map((task) => task.task_id);
      const tasks = await db.tasks.findMany({
        where: { id: { in: taskIds } },
      });

      // Combine data from both tables into a single object
      const combinedTasks = sharedTasks.map((sharedTask) => {
        const task = tasks.find((task) => task.id === sharedTask.task_id);
        return {
          id: sharedTask.id,
          shared_at: sharedTask.shared_at,
          original_user_that_created_task:
            sharedTask.original_user_that_created_task,
          shared_with_user_id: sharedTask.shared_with_user_id,
          task_id: sharedTask.task_id,
          title: task?.title,
          description: task?.description,
          completed: task?.completed,
        };
      });
      console.log(combinedTasks);
      console.log(combinedTasks);
      console.log(combinedTasks);
      console.log(combinedTasks);
      console.log(combinedTasks);
      console.log(combinedTasks);
      console.log(combinedTasks);
      console.log(combinedTasks);
      console.log(combinedTasks);
      console.log(combinedTasks);
      return combinedTasks;
    } catch (error) {
      throw new Error("Internal Server Error");
    }
  }),

  shareTaskToUserById: protectedProcedure
    .input(z.object({ task_id: z.string(), user_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const getTaskById = await db.tasks.findFirst({
          where: { id: input.task_id },
        });
        await db.shared_Tasks.create({
          data: {
            original_user_that_created_task: getTaskById?.user_id_that_created,
            task_id: input.task_id,
            shared_with_user_id: input.user_id,
          },
        });
        return true;
      } catch (error) {
        throw new Error("Internal Server Error");
      }
    }),
});

export default mainRouter;
