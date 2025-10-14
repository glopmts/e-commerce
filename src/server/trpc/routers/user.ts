import { z } from "zod";
import { publicProcedure, router } from "../init";

export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Tu lógica de base de datos aquí
      return { id: input.id, name: "John Doe", email: "john@example.com" };
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      // Lógica para crear usuario
      return { id: "1", ...input };
    }),
});
