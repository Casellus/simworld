import { requireUser } from "@/lib/auth";
import { createRecruitmentPost } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { GAMES } from "@/lib/constants";

export const metadata = { title: "Nuovo annuncio · SimWorld" };

type SP = Promise<{ team?: string; tipo?: string }>;

export default async function NuovoAnnuncioPage({ searchParams }: { searchParams: SP }) {
  const user = await requireUser();
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: myTeams } = await supabase
    .from("teams")
    .select("slug, name")
    .eq("owner_id", user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Pubblica annuncio</h1>
      <Card>
        <CardBody>
          <form action={createRecruitmentPost} className="space-y-5">
            <div>
              <Label htmlFor="post_type">Tipo annuncio *</Label>
              <Select id="post_type" name="post_type" required defaultValue={sp.tipo || ""}>
                <option value="" disabled>
                  Seleziona...
                </option>
                <option value="cerca_team">Cerco team (sono pilota)</option>
                <option value="cerca_pilota">Cerco pilota (per il mio team)</option>
              </Select>
            </div>

            {myTeams && myTeams.length > 0 && (
              <div>
                <Label htmlFor="team_slug">Team (solo se cerchi pilota)</Label>
                <Select id="team_slug" name="team_slug" defaultValue={sp.team || ""}>
                  <option value="">—</option>
                  {myTeams.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input id="title" name="title" required placeholder="es. Cerco team ACC GT3 weekend serali" />
            </div>

            <div>
              <Label htmlFor="game">Gioco</Label>
              <Select id="game" name="game" defaultValue="">
                <option value="">Indifferente</option>
                {GAMES.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descrizione *</Label>
              <Textarea
                id="description"
                name="description"
                rows={6}
                required
                placeholder="Livello, disponibilità, hardware, esperienza, obiettivi..."
              />
            </div>

            <div>
              <Label htmlFor="contact">Contatto (Discord, email)</Label>
              <Input id="contact" name="contact" placeholder="es. nickname#0000" />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Pubblica
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
