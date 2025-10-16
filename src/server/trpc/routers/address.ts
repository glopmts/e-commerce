import { db } from "@/lib/prisma";
import {
  addressListOutput,
  addressMutationOutput,
  addressOutput,
  createAddressInput,
  deleteAddressInput,
  setDefaultAddressInput,
  updateAddressInput,
} from "@/lib/schemas/address-schemas";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../init";

export const addressRouter = router({
  getAddresses: publicProcedure
    .input(z.object({ userId: z.string() }))
    .output(addressListOutput)
    .query(async ({ input }) => {
      try {
        if (!input.userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Você precisa estar logado",
          });
        }

        const addresses = await db.address.findMany({
          where: {
            userId: input.userId,
          },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });

        return addresses;
      } catch (error) {
        console.error("Error fetching addresses:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar endereços",
        });
      }
    }),

  getAddressById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string(),
      })
    )
    .output(addressListOutput)
    .query(async ({ input }) => {
      try {
        const address = await db.address.findFirst({
          where: {
            id: input.id,
            userId: input.userId,
          },
        });

        if (!address) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Endereço não encontrado",
          });
        }

        return [address];
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Error fetching address:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar endereço",
        });
      }
    }),

  createAddress: publicProcedure
    .input(createAddressInput)
    .output(addressMutationOutput)
    .mutation(async ({ input }) => {
      try {
        const {
          userId,
          zipCode,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          country,
          isDefault,
        } = input;

        if (isDefault) {
          await db.address.updateMany({
            where: {
              userId,
              isDefault: true,
            },
            data: {
              isDefault: false,
            },
          });
        }

        const address = await db.address.create({
          data: {
            userId,
            zipCode: zipCode.replace(/\D/g, ""),
            street,
            number,
            complement,
            neighborhood,
            city,
            state: state.toUpperCase(),
            country,
            isDefault,
          },
        });

        return {
          success: true,
          message: "Endereço criado com sucesso",
          address,
        };
      } catch (error) {
        console.error("Error creating address:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar endereço",
        });
      }
    }),

  updateAddress: publicProcedure
    .input(updateAddressInput)
    .output(addressMutationOutput)
    .mutation(async ({ input }) => {
      try {
        const { id, isDefault, ...updateData } = input;

        const existingAddress = await db.address.findFirst({
          where: { id },
        });

        if (!existingAddress) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Endereço não encontrado",
          });
        }

        if (isDefault) {
          await db.address.updateMany({
            where: {
              userId: existingAddress.userId,
              isDefault: true,
              id: { not: id },
            },
            data: {
              isDefault: false,
            },
          });
        }

        const address = await db.address.update({
          where: { id },
          data: {
            ...updateData,
            ...(updateData.zipCode && {
              zipCode: updateData.zipCode.replace(/\D/g, ""),
            }),
            ...(updateData.state && {
              state: updateData.state.toUpperCase(),
            }),
            ...(isDefault !== undefined && { isDefault }),
          },
        });

        return {
          success: true,
          message: "Endereço atualizado com sucesso",
          address,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Error updating address:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar endereço",
        });
      }
    }),

  deleteAddress: publicProcedure
    .input(deleteAddressInput)
    .output(addressMutationOutput)
    .mutation(async ({ input }) => {
      try {
        const { id, userId } = input;

        const existingAddress = await db.address.findFirst({
          where: {
            id,
            userId,
          },
        });

        if (!existingAddress) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Endereço não encontrado",
          });
        }

        // Não permitir deletar se for o único endereço
        const addressCount = await db.address.count({
          where: { userId },
        });

        if (addressCount <= 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Não é possível deletar o único endereço",
          });
        }

        // Se for o endereço padrão, definir outro como padrão
        if (existingAddress.isDefault) {
          const anotherAddress = await db.address.findFirst({
            where: {
              userId,
              id: { not: id },
            },
          });

          if (anotherAddress) {
            await db.address.update({
              where: { id: anotherAddress.id },
              data: { isDefault: true },
            });
          }
        }

        await db.address.delete({
          where: { id },
        });

        return {
          success: true,
          message: "Endereço deletado com sucesso",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Error deleting address:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao deletar endereço",
        });
      }
    }),

  setDefaultAddress: publicProcedure
    .input(setDefaultAddressInput)
    .output(addressMutationOutput)
    .mutation(async ({ input }) => {
      try {
        const { id, userId } = input;

        const existingAddress = await db.address.findFirst({
          where: {
            id,
            userId,
          },
        });

        if (!existingAddress) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Endereço não encontrado",
          });
        }

        await db.address.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });

        const address = await db.address.update({
          where: { id },
          data: { isDefault: true },
        });

        return {
          success: true,
          message: "Endereço definido como padrão",
          address,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Error setting default address:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao definir endereço padrão",
        });
      }
    }),

  getDefaultAddress: publicProcedure
    .input(z.object({ userId: z.string() }))
    .output(addressOutput.optional())
    .query(async ({ input }) => {
      try {
        const address = await db.address.findFirst({
          where: {
            userId: input.userId,
            isDefault: true,
          },
        });

        return address || undefined;
      } catch (error) {
        console.error("Error fetching default address:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar endereço padrão",
        });
      }
    }),
});
