import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Link "torna indietro" a pill con bordo + effetto premuto (.back-btn). */
export function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="back-btn mb-4">
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
