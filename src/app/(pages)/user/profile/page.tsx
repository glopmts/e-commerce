"use client";

import Fallback from "@/components/fallback";
import { trpc } from "@/server/trpc/client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import FormProfile from "./form-profile";

const ProfilePage = () => {
  const {
    data: user,
    isLoading: loadingUser,
    error,
    refetch,
  } = trpc.user.getCurrentUser.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const mutationUpdate = trpc.user.updaterUser.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar perfil:");
    },
  });

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [user, loadingUser, router]);

  const handleSubmit = (formData: {
    name: string;
    email: string;
    image?: string;
  }) => {
    mutationUpdate.mutate({
      id: user?.id!,
      name: formData.name,
      image: formData.image || "",
    });
  };

  if (loadingUser) {
    return <Fallback />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <div className="flex w-full h-full">
        <div className="w-full h-full">
          {pathname === "/user/profile" && (
            <FormProfile
              user={user}
              onSubmit={handleSubmit}
              isLoading={mutationUpdate.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
