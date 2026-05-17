"use client";

import { useState } from "react";
import { User as UserIcon } from "lucide-react";

export function ProfileAvatar({ src }: { src: string | null }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <UserIcon className="h-10 w-10 text-[var(--color-primary)]" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="h-full w-full object-cover"
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
}
