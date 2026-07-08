import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar user={session.user as any} />
      <div className="flex-1 lg:pl-64">
        <main className="min-h-screen px-4 py-6 pb-20 sm:px-6 lg:px-10 lg:py-8 lg:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
