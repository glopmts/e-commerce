import { db } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../init";

export const paymentMethodRouter = router({
  getActive: publicProcedure.query(async ({ ctx }) => {
    try {
      const paymentMethod = await db.paymentMethod.findMany({
        where: {
          isActive: true,
        },
      });

      return paymentMethod;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get active paymentMethod: " + error,
      });
    }
  }),
});
