"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User } from "@/types/interfaces";
import { formatUserName } from "@/utils/format-name";
import { Pen, ShoppingBag, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { LinksProfile } from "../links-navegation";

type UserProps = {
  user: User;
  pathname: string;
};

const SidebarUser = ({ user, pathname }: UserProps) => {
  return (
    <div className="w-auto mr-8 h-full p-2 md:sticky top-0">
      <div className="flex items-center gap-2 pb-10">
        <Avatar className={cn("w-12 h-12")}>
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="bg-amber-600 border border-amber-800">
            {user?.name.charAt(0) || "G"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">
            {formatUserName(user.name)}
          </span>
          <Link
            href="/user/profile"
            className="flex items-center text-sm gap-2 text-zinc-400"
          >
            <Pen size={12} /> Editar perfil
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="pb-2 flex items-center gap-1.5">
          <UserIcon size={20} />
          <h2 className="font-semibold">Minha conta</h2>
        </div>
        <div className="flex flex-col items-baseline gap-1.5">
          {LinksProfile.map((link, index) => (
            <Button
              className={link.href === pathname ? "text-amber-400" : ""}
              asChild
              variant="link"
              key={index}
            >
              <Link href={link.href}>
                <span>{link.label}</span>
              </Link>
            </Button>
          ))}
        </div>
        <div className="mt-2">
          <Link
            href="/user/purchase"
            className="flex items-center gap-2 hover:border-b"
          >
            <ShoppingBag size={18} />
            <span>Minhas compras</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SidebarUser;
