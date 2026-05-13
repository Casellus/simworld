"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function createTeam(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorizzato");

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const recruiting = formData.get("recruiting") === "on";

  if (!name) throw new Error("Nome obbligatorio.");

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let i = 0;
  while (true) {
    const { data } = await supabase.from("teams").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    i++;
    slug = `${baseSlug}-${i}`;
  }

  const { data: team, error } = await supabase
    .from("teams")
    .insert({
      slug,
      name,
      description: description || null,
      owner_id: user.id,
      recruiting,
    })
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);

  const gameSlugs = formData.getAll("games").map(String);
  if (gameSlugs.length > 0) {
    const { data: games } = await supabase.from("games").select("id, slug").in("slug", gameSlugs);
    if (games && games.length > 0) {
      await supabase.from("team_games").insert(games.map((g) => ({ team_id: team.id, game_id: g.id })));
    }
  }

  revalidatePath("/team");
  redirect(`/team/${team.slug}`);
}

export async function updateTeam(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorizzato");

  const teamId = String(formData.get("team_id") || "");
  const { data: team } = await supabase.from("teams").select("id, slug, owner_id").eq("id", teamId).single();
  if (!team || team.owner_id !== user.id) throw new Error("Non autorizzato");

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const recruiting = formData.get("recruiting") === "on";
  const logo_url = formData.get("logo_url") ? String(formData.get("logo_url")) : undefined;

  if (!name) throw new Error("Nome obbligatorio.");

  const updateData: Record<string, unknown> = { name, description: description || null, recruiting };
  if (logo_url !== undefined) updateData.logo_url = logo_url || null;

  const { error } = await supabase.from("teams").update(updateData).eq("id", teamId);
  if (error) throw new Error(error.message);

  // update games
  const gameSlugs = formData.getAll("games").map(String);
  await supabase.from("team_games").delete().eq("team_id", teamId);
  if (gameSlugs.length > 0) {
    const { data: games } = await supabase.from("games").select("id, slug").in("slug", gameSlugs);
    if (games && games.length > 0) {
      await supabase.from("team_games").insert(games.map((g) => ({ team_id: teamId, game_id: g.id })));
    }
  }

  revalidatePath("/team");
  revalidatePath(`/team/${team.slug}`);
  redirect(`/team/${team.slug}`);
}

export async function deleteTeam(teamId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const { data: team } = await supabase.from("teams").select("id, owner_id").eq("id", teamId).single();
  if (!team || team.owner_id !== user.id) return { error: "Non autorizzato" };

  const { error } = await supabase.from("teams").delete().eq("id", teamId);
  if (error) return { error: error.message };

  revalidatePath("/team");
  return {};
}

export async function joinTeam(teamId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };
  // members add via team_members; only owners can per RLS — fallback: create recruitment_post in real flow
  // For MVP we mark intent via recruitment_posts instead
  const { error } = await supabase.from("recruitment_posts").insert({
    post_type: "cerca_team",
    user_id: user.id,
    team_id: teamId,
    title: "Candidatura al team",
    description: "Vorrei unirmi a questo team.",
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function leaveTeam(teamId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };
  const { error } = await supabase.from("team_members").delete().eq("team_id", teamId).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath(`/team`);
  return { ok: true };
}
