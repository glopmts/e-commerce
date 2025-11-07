"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, MapPinCheck, ShoppingCart, Star, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { useAddress } from "../../hooks/useAddress";
import { authClient } from "../../lib/auth/auth-client";
import { cn } from "../../lib/utils";
import { trpc } from "../../server/trpc/client";
import { UserProps } from "../../types/interfaces";
import { formatUserName } from "../../utils/format-name";
import { ModeToggle } from "../ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import CartItem from "./Cart-Items";
import Search from "./Search";

const Links = [
  {
    label: "Favoritos",
    href: "/user/favorite",
    icon: Star,
  },
  {
    label: "Compras",
    href: "/user/purchase",
    icon: ShoppingCart,
  },
];

const Header = () => {
  const {
    data: user,
    isLoading: loaderUser,
    error,
  } = trpc.user.getCurrentUser.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const userId = user?.id as string;
  const { addresses, isLoading } = useAddress(userId);
  const formattedName = formatUserName(user?.name);
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.reload();
        },
      },
    });
  };

  return (
    <header className="w-full h-auto p-2 sticky top-0 bg-amber-300 border-b z-30">
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
          ) : user?.id ? (
            <MenuDropdown user={user} handleSignOut={handleSignOut} />
          ) : (
            <Button asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </div>
      </nav>
      <div className="flex justify-between items-center max-w-6xl mx-auto mt-4">
        <div className="">
          {isLoading || loaderUser ? (
            <Spinner className="size-6" />
          ) : (
            addresses.map((address) => (
              <Link
                href={`/user/address`}
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

type DropdownProps = {
  user: UserProps;
  handleSignOut: () => void;
};

const MenuDropdown = ({ user, handleSignOut }: DropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className={cn("w-10 h-10")}>
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="bg-amber-600 border border-amber-800">
            {user?.name.charAt(0) || "G"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <div className="flex items-center gap-2.5">
            <Avatar className={cn("w-10 h-10")}>
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="bg-amber-600 border border-amber-800">
                {user?.name.charAt(0) || "G"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 w-30">
              <span className="text-base text-zinc-400 line-clamp-1 truncate">
                {user.name || "User"}
              </span>
              <span className="text-sm text-zinc-400 ine-clamp-1 truncate">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/user/profile" className="flex items-center gap-1.5">
            <User size={20} />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/purchase" className="flex items-center gap-1.5">
            <ShoppingCart size={20} />
            Minhas compras
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Button
            className="w-full text-white"
            variant="destructive"
            onClick={handleSignOut}
          >
            Sair <LogOut size={18} />
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Header;
