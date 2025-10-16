"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader,
  RefreshCcw,
  ShoppingCart,
  Terminal,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { trpc } from "../../server/trpc/client";
import { Images } from "../../types/interfaces";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

function ErrorMessage({ error }: { error: string }) {
  return (
    <Alert variant="destructive">
      <Terminal />
      <AlertTitle>Ops!</AlertTitle>
      <AlertDescription>
        Error ao carregar dados do Carrinho!
        {error}
      </AlertDescription>
    </Alert>
  );
}

export default function CartItem({ userId }: { userId: string }) {
  const utils = trpc.useUtils();
  const {
    data: cart,
    isLoading,
    error,
    refetch,
  } = trpc.cart.getCart.useQuery();
  const [isRefetch, setRefetch] = useState(false);

  const removeFromCart = trpc.cart.deleteCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
    },
  });

  const handleRemoveItem = (cartItemId: string) => {
    removeFromCart.mutateAsync({
      cartId: cartItemId,
      userId,
    });
  };

  const handleRefetch = () => {
    setRefetch(true);
    refetch();
    setTimeout(() => {
      setRefetch(false);
    }, 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="rounded-full h-10 w-10 p-0 relative"
        >
          <ShoppingCart size={25} className="dark:text-black" />
          {cart && cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {cart.length}
            </span>
          )}
          <span className="sr-only">Abrir menu do Cart</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-82 md:w-86 p-4">
        {error && <ErrorMessage error={error.message} />}
        <div className="space-y-4">
          <div className="pb-3 justify-between flex items-center">
            <div className="">
              <span className="text-base font-semibold">
                Total: {cart?.length || 0}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              disabled={isRefetch}
              onClick={handleRefetch}
            >
              {isRefetch ? (
                <RefreshCcw className="animate-spin" />
              ) : (
                <RefreshCcw />
              )}
            </Button>
          </div>
          <Separator />
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader size={20} className="animate-spin" />
            </div>
          ) : cart && cart.length > 0 ? (
            <>
              <h3 className="font-semibold">Seu Carrinho</h3>
              <ScrollArea className="w-full h-45">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <Cards
                      key={item.id}
                      item={item}
                      handleRemoveItem={handleRemoveItem}
                    />
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t pt-3">
                <div className="w-full mb-4 flex items-center gap-2.5">
                  <span>
                    Total:{" "}
                    {cart
                      .reduce(
                        (acc, item) => acc + item.product.price * item.quantity,
                        0
                      )
                      .toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                  </span>
                </div>
                <Button className="w-full" asChild>
                  <Link href="/checkout/cart">Finalizar Compra</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <ShoppingCart size={32} className="text-zinc-300" />
              <span className="text-sm">Seu carrinho está vazio</span>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    images: Images[];
    thumbnail: string | null;
  };
};

function Cards({
  item,
  handleRemoveItem,
}: {
  item: CartItem;
  handleRemoveItem: (cartItemId: string) => void;
}) {
  return (
    <div
      key={item.id}
      className="flex gap-3 items-start border bg-gray-200 dark:bg-zinc-900 p-2 rounded-md"
    >
      <Link href={`/product/${item.product.slug}`} className="flex-shrink-0">
        <div className="w-20 h-20 relative">
          <Image
            src={
              item.product.thumbnail ||
              item.product.images?.[0].url ||
              "/placeholder.svg"
            }
            alt={item.product.title}
            fill
            sizes="100vw"
            className="rounded-md object-cover"
          />
        </div>
      </Link>
      <div className="flex-1">
        <Link
          href={`/product/${item.product.slug}`}
          className="text-sm font-medium hover:underline line-clamp-2"
        >
          {item.product.title}
        </Link>
        <div className="flex justify-between items-center mt-1">
          <div className="flex flex-col">
            <span className="text-sm font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(item.product.price)}
            </span>
            <span className="text-xs text-gray-500">Qtd: {item.quantity}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleRemoveItem(item.id)}
          >
            <Trash2 size={14} className="text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
