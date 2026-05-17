"use client";

import { useTransition } from "react";
import Link from "next/link";
import { joinEvent, leaveEvent } from "../actions";
import { Button } from "@/components/ui/button";

export function JoinButton({ eventId, isJoined, isLogged }: { eventId: string; isJoined: boolean; isLogged: boolean }) {
  const [pending, start] = useTransition();

  if (!isLogged) {
    return (
      <Link href="/auth/login">
        <Button className="w-full">Accedi per iscriverti</Button>
      </Link>
    );
  }

  function handle() {
    start(async () => {
      if (isJoined) await leaveEvent(eventId);
      else await joinEvent(eventId);
    });
  }

  return (
    <Button variant={isJoined ? "outline" : "primary"} className="w-full" onClick={handle} disabled={pending}>
      {pending ? "..." : isJoined ? "Annulla iscrizione" : "Iscriviti"}
    </Button>
  );
}
