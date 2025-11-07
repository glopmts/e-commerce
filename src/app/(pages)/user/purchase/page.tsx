"use client";

import Fallback from "@/components/fallback";
import Title from "@/components/TitleComponent";
import { trpc } from "@/server/trpc/client";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "../../../../components/ui/button";

const PurchaseUser = () => {
  const { data: user, isLoading: loadingUser } =
    trpc.user.getCurrentUser.useQuery(undefined, {
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
  const userId = user?.id as string;
  const {
    data: purchases,
    isLoading: isLoaderPurchase,
    refetch: refetchPurchase,
  } = trpc.purchase.getUserOrders.useQuery();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [user, loadingUser, router]);

  if (loadingUser) {
    return <Fallback />;
  }

  if (!purchases?.length) {
    return (
      <div className="w-full h-full min-h-screen p-2">
        <div className="pb-6">
          <Title>Minhas compras</Title>
        </div>
        <div className="w-full h-full flex items-center justify-center flex-col gap-2.5">
          <div className="">
            <div className="p-4 w-20 h-20 rounded-full shadow dark:bg-zinc-800 bg-gray-300 border items-center justify-center flex">
              <ShoppingBag size={29} />
            </div>
          </div>
          <span>Nenhuma comprar encontrada!</span>
          <div className="mt-4">
            <Button variant="default" asChild>
              <Link href="/products">
                <span>Ver produtos</span>
                <ArrowUpRight size={16} className="animate-pulse" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen p-2">
      <div className="pb-6">
        <Title>Minhas compras</Title>
      </div>
      <div className="w-full h-full"></div>
    </div>
  );
};

export default PurchaseUser;
