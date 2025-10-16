"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { cn } from "../../lib/utils";
import { trpc } from "../../server/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Spinner } from "../ui/spinner";
import Search from "./Search";

const Header = () => {
  const { data: user, isLoading } = trpc.user.getCurrentUser.useQuery();

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
        <div className="">
          {isLoading ? (
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
    </header>
  );
};

export default Header;
