"use client";

import AddressInfor from "@/components/checkout/address-infor";
import Fallback from "@/components/fallback";
import Title from "@/components/TitleComponent";
import { trpc } from "@/server/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ModalAddress from "../../../../components/user/modal-address";

const AdressPage = () => {
  const { data: user, isLoading: loadingUser } =
    trpc.user.getCurrentUser.useQuery(undefined, {
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
  const {
    data: adress,
    isLoading,
    refetch,
    error,
  } = trpc.address.getAddresses.useQuery({
    userId: user?.id as string,
  });
  const { data: addresses = [], isLoading: addressesLoading } =
    trpc.address.getAddresses.useQuery({
      userId: user?.id as string,
    });

  const router = useRouter();
  const [shippingAddressId, setShippingAddressId] = useState<string>(() => {
    const defaultAddress = addresses.find((addr) => addr.isDefault);
    return defaultAddress?.id || addresses[0]?.id || "";
  });

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [user, loadingUser, router]);

  if (loadingUser || isLoading) {
    return <Fallback />;
  }

  const mutationAdress = trpc.address.setDefaultAddress.useMutation({
    onSuccess: () => {
      toast.success("Endereço ativo atualizado com sucesso!");
      refetch();
    },
    onError: () => {
      toast.error("Error ao defenir endereço ativo!");
    },
  });

  const handleAddressSelect = (addressId: string) => {
    setShippingAddressId(addressId);
    mutationAdress.mutateAsync({
      id: addressId,
      userId: user?.id as string,
    });
  };

  return (
    <div className="w-full h-full mt-8 md:mt-0">
      <div
        className="pb-6 flex gap-2.5 md:gap-0
       md:justify-between w-full md:items-center flex-col md:flex-row"
      >
        <Title>Meus endereçõs</Title>
        <ModalAddress
          type="create"
          userId={user?.id as string}
          refetch={refetch}
        />
      </div>
      <div className="w-full h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {adress?.map((adss) => (
            <div
              key={adss.id}
              className="cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => handleAddressSelect(adss.id)}
            >
              <AddressInfor
                address={adss}
                shippingAddressId={shippingAddressId}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdressPage;
