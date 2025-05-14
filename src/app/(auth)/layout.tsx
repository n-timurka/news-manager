import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="mb-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-2xl">NewsHub</span>
        </Link>
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md">
        {children}
      </div>
    </div>
  );
}