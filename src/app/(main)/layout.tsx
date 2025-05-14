import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 py-4 container mx-auto">{children}</main>
      <Footer />
      <Toaster />
    </main>
  );
}