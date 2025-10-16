import { trpc } from "@/server/trpc/client";
import { useCallback } from "react";

export const useAddress = (userId: string) => {
  const utils = trpc.useUtils();

  const {
    data: addresses = [],
    isLoading,
    error,
  } = trpc.address.getAddresses.useQuery({ userId }, { enabled: !!userId });

  const createMutation = trpc.address.createAddress.useMutation({
    onSuccess: () => {
      utils.address.getAddresses.invalidate({ userId });
    },
  });

  const updateMutation = trpc.address.updateAddress.useMutation({
    onSuccess: () => {
      utils.address.getAddresses.invalidate({ userId });
    },
  });

  const deleteMutation = trpc.address.deleteAddress.useMutation({
    onSuccess: () => {
      utils.address.getAddresses.invalidate({ userId });
    },
  });

  const setDefaultMutation = trpc.address.setDefaultAddress.useMutation({
    onSuccess: () => {
      utils.address.getAddresses.invalidate({ userId });
    },
  });

  const createAddress = useCallback(
    async (addressData: any) => {
      return await createMutation.mutateAsync({
        ...addressData,
        userId,
      });
    },
    [createMutation, userId]
  );

  const updateAddress = useCallback(
    async (addressData: any) => {
      return await updateMutation.mutateAsync(addressData);
    },
    [updateMutation]
  );

  const deleteAddress = useCallback(
    async (id: string) => {
      return await deleteMutation.mutateAsync({ id, userId });
    },
    [deleteMutation, userId]
  );

  const setDefaultAddress = useCallback(
    async (id: string) => {
      return await setDefaultMutation.mutateAsync({ id, userId });
    },
    [setDefaultMutation, userId]
  );

  return {
    addresses,
    isLoading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSettingDefault: setDefaultMutation.isPending,
  };
};
