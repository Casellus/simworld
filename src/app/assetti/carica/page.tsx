"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadSetupFull } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { GAMES } from "@/lib/constants";

export default function CaricaAssettoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const res = await uploadSetupFull(fd);

    if (res.error || !res.id) {
      setError(res.error || "Errore sconosciuto. Riprova.");
      setLoading(false);
      return;
    }

    router.push(`/assetti/${res.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Carica assetto</h1>
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input id="title" name="title" required placeholder="es. Monza GT3 asciutto - quali" />
            </div>

            <div>
              <Label htmlFor="game">Gioco *</Label>
              <Select id="game" name="game" required defaultValue="">
                <option value="" disabled>Seleziona...</option>
                {GAMES.map((g) => (
                  <option key={g.slug} value={g.slug}>{g.name}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="car">Auto *</Label>
                <Input id="car" name="car" required placeholder="es. Ferrari 296 GT3" />
              </div>
              <div>
                <Label htmlFor="track">Tracciato *</Label>
                <Input id="track" name="track" required placeholder="es. Monza" />
              </div>
            </div>

            <div>
              <Label htmlFor="conditions">Condizioni</Label>
              <Input id="conditions" name="conditions" placeholder="es. Asciutto 25°C - qualifying" />
            </div>

            <div>
              <Label htmlFor="file">File assetto (opzionale)</Label>
              <Input id="file" name="file" type="file" accept=".json,.sto,.svm,.ini,.rcd,.txt,.xml,.zip" />
              <p className="text-xs text-[var(--color-fg-muted)] mt-1">.json (ACC), .sto (rF2/LMU), .svm, .ini, .rcd, .xml, .zip · max 5MB</p>
            </div>

            <div>
              <Label htmlFor="notes">Note / configurazione</Label>
              <Textarea id="notes" name="notes" rows={6} placeholder="Stile guida, settaggi consigliati, FFB, TC/ABS..." />
            </div>

            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Pubblicazione..." : "Pubblica assetto"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
