"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import MainMenu from "./MainMenu";
import ProfileMenu from "./ProfileMenu";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            NewsHub
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <MainMenu />
              <ProfileMenu />
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}