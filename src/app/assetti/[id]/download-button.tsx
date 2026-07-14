"use client";

import { incrementDownload } from "../actions";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DownloadButton({ setupId, fileUrl }: { setupId: string; fileUrl: string }) {
  async function handle() {
    await incrementDownload(setupId);
    // noopener/noreferrer prevents the opened tab from accessing window.opener
    // and strips the referrer.
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  }
  return (
    <Button className="w-full" onClick={handle}>
      <Download className="h-4 w-4" /> Scarica file
    </Button>
  );
}
