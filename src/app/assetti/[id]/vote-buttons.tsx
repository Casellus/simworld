"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { voteSetup } from "../actions";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export function VoteButtons({ setupId, myVote, isLogged }: { setupId: string; myVote: number; isLogged: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!isLogged) {
    return (
      <Link href="/auth/login" className="block">
        <Button variant="outline" className="w-full">
          Accedi per votare
        </Button>
      </Link>
    );
  }

  function vote(v: 1 | -1) {
    start(async () => {
      await voteSetup(setupId, (myVote === v ? 0 : v) as 1 | -1 | 0);
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant={myVote === 1 ? "primary" : "outline"}
        size="sm"
        onClick={() => vote(1)}
        disabled={pending}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        variant={myVote === -1 ? "danger" : "outline"}
        size="sm"
        onClick={() => vote(-1)}
        disabled={pending}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
