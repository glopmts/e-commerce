"use client";

import { MapPinCheck, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { useAddress } from "../../hooks/useAddress";
import { cn } from "../../lib/utils";
import { trpc } from "../../server/trpc/client";
import { formatUserName } from "../../utils/format-name";
import { ModeToggle } from "../ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Spinner } from "../ui/spinner";
import CartItem from "./CartItems";
import Search from "./Search";

const Links = [
  {
    label: "Favoritos",
    href: "/profile/favorite",
    icon: Star,
  },
  {
    label: "Compras",
    href: "/profile/purchase",
    icon: ShoppingCart,
  },
];

const Header = () => {
  const { data: user, isLoading: loaderUser } =
    trpc.user.getCurrentUser.useQuery();
  const userId = user?.id as string;
  const { addresses, isLoading } = useAddress(userId);
  const formattedName = formatUserName(user?.name);

  return (
    <header className="w-full h-auto p-2 sticky top-0 bg-amber-300 border-b ">
      <nav className="w-full h-full items-center flex justify-between max-w-6xl mx-auto">
        <div className="">
          <Link href="/" className="flex items-center gap-2 text-gray-800">
            <Image
              src="/logo.png"
              alt="VlopShoop"
              width={50}
              height={50}
              sizes="100vw"
              className="object-cover rounded-md"
            />
            <span className="text-2xl font-semibold">VlopShoop</span>
          </Link>
        </div>
        <div className="md:max-w-md lg:max-w-lg w-full">
          <Suspense fallback={<Spinner />}>
            <Search />
          </Suspense>
        </div>
        <div className="flex items-center gap-3.5">
          <ModeToggle />

          {loaderUser ? (
            <div className="w-9 h-9 flex items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ) : (
            <Avatar className={cn("w-10 h-10")}>
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="bg-amber-600 border border-amber-800">
                {user?.name.charAt(0) || "G"}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </nav>
      <div className="flex justify-between items-center max-w-6xl mx-auto mt-4">
        <div className="">
          {isLoading ? (
            <Spinner className="size-6" />
          ) : (
            addresses.map((address) => (
              <Link
                href={`/profile/address`}
                key={address.id}
                className="text-black flex items-center gap-2.5 hover:opacity-70"
              >
                <div className="">
                  <MapPinCheck size={26} className="text-zinc-500" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="line-clamp-1 truncate text-sm text-gray-500">
                    Enviar para: {formattedName}
                  </span>
                  <p className="text-base line-clamp-1 truncate">
                    {address.street}, {address.number}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex items-center gap-2.5 text-black">
            {Links.map((c) => (
              <Link
                href={c.href}
                key={c.href}
                className="flex items-center gap-2 text-sm hover:border-b"
              >
                <c.icon size={12} />
                <span>{c.label}</span>
              </Link>
            ))}
          </div>
          <CartItem userId={user?.id as string} />
        </div>
      </div>
    </header>
  );
};

export default Header;
