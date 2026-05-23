"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function NavAuthButtons() {
  const pathname = usePathname();
  if (pathname.startsWith("/auth/")) return null;
  return (
    <>
      <Link href="/auth/login">
        <Button variant="ghost" size="sm">Accedi</Button>
      </Link>
      <Link href="/auth/register">
        <Button size="sm">Registrati</Button>
      </Link>
    </>
  );
}

export function MobileNavAuthButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/auth/")) return null;
  return (
    <Link href="/auth/login">
      <Button size="sm">Accedi</Button>
    </Link>
  );
}
