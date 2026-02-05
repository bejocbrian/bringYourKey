import { MainSidebar } from "@/components/layout/main-sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <MainSidebar />
      <main className="flex-1 lg:pl-64">
        {children}
      </main>
    </div>
  );
}
