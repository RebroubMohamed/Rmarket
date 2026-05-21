// src/app/admin/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import "@/app/globals.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await getServerSession(authOptions);
  // if (!session) redirect("/login");

  const sessionUser = session.user as
    | { nom?: string; name?: string; email?: string }
    | undefined;
  const user = {
    nom: sessionUser?.nom || sessionUser?.name || "Admin",
    email: sessionUser?.email || "",
  };

  return (
    <div className='flex h-screen bg-background overflow-hidden'>
      <Sidebar />
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        <Navbar user={user} />
        <main className='flex-1 overflow-y-auto p-6'>
          <div className='max-w-[1600px] mx-auto'>{children}</div>
        </main>
      </div>
    </div>
  );
}
