import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";
import { one } from "@/lib/types";

export const metadata = { title: "Impostazioni · SimUniverse" };

export default async function ImpostazioniPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data: userGames } = await supabase
    .from("user_games").select("skill_level, games(slug)").eq("user_id", profile.id);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Impostazioni profilo</h1>
      <Card>
        <CardBody>
          <SettingsForm
            profile={profile}
            userGames={(userGames || []).map((ug) => ({
              slug: one<{ slug: string }>(ug.games)?.slug ?? "",
              skill: ug.skill_level ?? "intermedio",
            }))}
          />
        </CardBody>
      </Card>
    </div>
  );
}
