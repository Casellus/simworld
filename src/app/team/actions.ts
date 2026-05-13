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

export async function joinTeam(teamId: string, message?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const { error } = await supabase.from("team_applications").insert({
    team_id: teamId,
    user_id: user.id,
    message: message || null,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function updateApplication(applicationId: string, status: "accepted" | "rejected") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  // fetch application to get team_id + applicant user_id
  const { data: app } = await supabase
    .from("team_applications")
    .select("id, team_id, user_id")
    .eq("id", applicationId)
    .single();
  if (!app) return { error: "Candidatura non trovata" };

  // verify caller is team owner
  const { data: team } = await supabase
    .from("teams")
    .select("id, slug, owner_id")
    .eq("id", app.team_id)
    .single();
  if (!team || team.owner_id !== user.id) return { error: "Non autorizzato" };

  const { error } = await supabase
    .from("team_applications")
    .update({ status })
    .eq("id", applicationId);
  if (error) return { error: error.message };

  if (status === "accepted") {
    // add to team_members (ignore if already member)
    await supabase.from("team_members").upsert(
      { team_id: app.team_id, user_id: app.user_id, role: "pilota" },
      { onConflict: "team_id,user_id" }
    );

    // notify applicant
    await supabase.from("notifications").insert({
      user_id: app.user_id,
      type: "application_accepted",
      title: "Candidatura accettata!",
      body: `Sei stato accettato nel team ${team.slug}.`,
      link: `/team/${team.slug}`,
    });
  } else {
    // notify rejection
    await supabase.from("notifications").insert({
      user_id: app.user_id,
      type: "application_rejected",
      title: "Candidatura non accettata",
      body: `La tua candidatura al team ${team.slug} non è andata a buon fine.`,
      link: `/team/${team.slug}`,
    });
  }

  revalidatePath(`/team/${team.slug}`);
  revalidatePath("/dashboard");
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
