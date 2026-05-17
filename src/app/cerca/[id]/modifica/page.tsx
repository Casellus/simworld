import { requireUser } from "@/lib/auth";
import { updateRecruitmentPost } from "../../actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { GAMES } from "@/lib/constants";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const metadata = { title: "Modifica annuncio · SimUniverse" };

export default async function ModificaAnnuncioPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("recruitment_posts")
    .select("id, user_id, post_type, title, description, contact, games(slug)")
    .eq("id", id)
    .single();

  if (!post) notFound();
  if (post.user_id !== user.id) redirect("/cerca");

  const gameSlug = Array.isArray(post.games)
    ? (post.games[0] as { slug: string } | undefined)?.slug ?? ""
    : (post.games as { slug: string } | null)?.slug ?? "";

  async function action(formData: FormData) {
    "use server";
    await updateRecruitmentPost(id, formData);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Modifica annuncio</h1>
      <Card>
        <CardBody>
          <form action={action} className="space-y-5">
            <div>
              <Label htmlFor="post_type">Tipo annuncio</Label>
              <Select id="post_type" name="post_type" disabled defaultValue={post.post_type}>
                <option value="cerca_team">Cerco team (sono pilota)</option>
                <option value="cerca_pilota">Cerco pilota (per il mio team)</option>
              </Select>
              <input type="hidden" name="post_type" value={post.post_type} />
            </div>

            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input id="title" name="title" required defaultValue={post.title} />
            </div>

            <div>
              <Label htmlFor="game">Gioco</Label>
              <Select id="game" name="game" defaultValue={gameSlug}>
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
                defaultValue={post.description ?? ""}
              />
            </div>

            <div>
              <Label htmlFor="contact">Contatto</Label>
              <Input
                id="contact"
                name="contact"
                defaultValue={post.contact ?? ""}
                placeholder="es. https://discord.gg/invito, @username, email@esempio.com"
              />
              <p className="mt-1.5 text-xs text-[var(--color-fg-muted)]">
                Inserisci un link (Discord, sito) o testo (username, email). I link saranno cliccabili.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" size="lg" className="flex-1">
                Salva modifiche
              </Button>
              <Link href="/cerca">
                <Button type="button" variant="outline" size="lg">Annulla</Button>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
