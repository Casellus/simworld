import { requireUser } from "@/lib/auth";
import { uploadSetup } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { GAMES } from "@/lib/constants";

export const metadata = { title: "Carica assetto · SimWorld" };

export default async function CaricaAssettoPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Carica assetto</h1>
      <Card>
        <CardBody>
          <form action={uploadSetup} className="space-y-5">
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input id="title" name="title" required placeholder="es. Monza GT3 asciutto - quali" />
            </div>

            <div>
              <Label htmlFor="game">Gioco *</Label>
              <Select id="game" name="game" required defaultValue="">
                <option value="" disabled>
                  Seleziona...
                </option>
                {GAMES.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.name}
                  </option>
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
              <Label htmlFor="file">File assetto (max 5MB)</Label>
              <Input id="file" name="file" type="file" accept=".json,.sto,.svm,.ini,.rcd,.txt,.xml,.zip" />
              <p className="text-xs text-[var(--color-fg-muted)] mt-1">
                Formati: .json (ACC), .sto (rF2/LMU), .svm, .ini, .rcd, .xml, .zip
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Note / configurazione</Label>
              <Textarea id="notes" name="notes" rows={6} placeholder="Stile guida, settaggi consigliati, FFB, TC/ABS..." />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Pubblica assetto
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
