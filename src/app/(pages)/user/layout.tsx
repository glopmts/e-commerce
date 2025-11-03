"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Fallback from "../../../components/fallback";
import { Separator } from "../../../components/ui/separator";
import { trpc } from "../../../server/trpc/client";
import SidebarUser from "./profile/sidebar-nave";

const UserLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { data: user, isLoading: loadingUser } =
    trpc.user.getCurrentUser.useQuery(undefined, {
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [user, loadingUser, router]);

  if (loadingUser) {
    return <Fallback />;
  }

  return (
    <div className="min-h-screen flex w-full flex-col md:flex-row h-full max-w-6xl mx-auto p-8">
      <SidebarUser pathname={pathname} user={user!} />
      <Separator className="md:hidden" />
      <div className="flex-1 h-full w-full overflow-hidden">{children}</div>
    </div>
  );
};

export default UserLayout;
