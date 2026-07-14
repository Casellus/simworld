"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { sendApplicationAccepted, sendApplicationRejected } from "@/lib/email";
import { awardXp, revokeXp } from "@/lib/xp";
import { text, textOrNull, LIMITS, GENERIC_ERROR } from "@/lib/validation";

// Notifications have no client INSERT policy (see supabase/security_migration.sql):
// a user must never be able to forge a notification for someone else. Writes go
// through the service-role client, after the caller has been authorized above.
async function notify(row: {
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from("notifications").insert(row);
  if (error) console.error("notify failed:", error.message);
}

export async function createTeam(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorizzato");

  const name = text(formData.get("name"), LIMITS.name);
  const description = textOrNull(formData.get("description"), LIMITS.description);
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
      description,
      owner_id: user.id,
      recruiting,
    })
    .select("id, slug")
    .single();

  if (error) {
    console.error("createTeam failed:", error.message);
    throw new Error(GENERIC_ERROR);
  }

  const gameSlugs = formData.getAll("games").map(String);
  if (gameSlugs.length > 0) {
    const { data: games } = await supabase.from("games").select("id, slug").in("slug", gameSlugs);
    if (games && games.length > 0) {
      await supabase.from("team_games").insert(games.map((g) => ({ team_id: team.id, game_id: g.id })));
    }
  }

  await awardXp(user.id, "team_create", team.id);

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

  const name = text(formData.get("name"), LIMITS.name);
  const description = textOrNull(formData.get("description"), LIMITS.description);
  const recruiting = formData.get("recruiting") === "on";
  const logo_url = formData.get("logo_url") ? String(formData.get("logo_url")) : undefined;

  if (!name) throw new Error("Nome obbligatorio.");

  const updateData: Record<string, unknown> = { name, description, recruiting };
  if (logo_url !== undefined) updateData.logo_url = logo_url || null;

  const { error } = await supabase.from("teams").update(updateData).eq("id", teamId);
  if (error) {
    console.error("updateTeam failed:", error.message);
    throw new Error(GENERIC_ERROR);
  }

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
  if (error) {
    console.error("deleteTeam failed:", error.message);
    return { error: GENERIC_ERROR };
  }

  await revokeXp(team.owner_id, "team_create", teamId);

  revalidatePath("/team");
  revalidatePath("/");
  return {};
}

export async function joinTeam(teamId: string, message?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  // The team must exist and be actively recruiting.
  const { data: team } = await supabase
    .from("teams")
    .select("owner_id, name, slug, recruiting")
    .eq("id", teamId)
    .single();
  if (!team) return { error: "Team non trovato." };
  if (!team.recruiting) return { error: "Questo team non sta reclutando." };
  if (team.owner_id === user.id) return { error: "Sei già il proprietario di questo team." };

  // Already a member?
  const { data: member } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (member) return { error: "Sei già membro di questo team." };

  const safeMessage = message ? String(message).trim().slice(0, LIMITS.message) || null : null;
  const { error } = await supabase.from("team_applications").insert({
    team_id: teamId,
    user_id: user.id,
    message: safeMessage,
  });
  if (error) {
    console.error("joinTeam failed:", error.message);
    return { error: GENERIC_ERROR };
  }

  // notify team owner
  if (team.owner_id !== user.id) {
    const { data: applicantProfile } = await supabase
      .from("profiles")
      .select("display_name, username")
      .eq("id", user.id)
      .single();
    const pilotName = applicantProfile?.display_name || applicantProfile?.username || "Un pilota";

    await notify({
      user_id: team.owner_id,
      type: "new_application",
      title: "Nuova candidatura",
      body: `${pilotName} vuole entrare nel tuo team ${team.name}.`,
      link: `/team/${team.slug}`,
    });
  }

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
    .select("id, name, slug, owner_id")
    .eq("id", app.team_id)
    .single();
  if (!team || team.owner_id !== user.id) return { error: "Non autorizzato" };

  const { error } = await supabase
    .from("team_applications")
    .update({ status })
    .eq("id", applicationId);
  if (error) {
    console.error("updateApplication failed:", error.message);
    return { error: GENERIC_ERROR };
  }

  // fetch applicant email + display name
  const admin = createAdminClient();
  const { data: authUser } = await admin.auth.admin.getUserById(app.user_id);
  const applicantEmail = authUser?.user?.email;
  const { data: applicantProfile } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", app.user_id)
    .single();
  const pilotName = applicantProfile?.display_name || applicantProfile?.username || "Pilota";

  if (status === "accepted") {
    // add to team_members (ignore if already member)
    await supabase.from("team_members").upsert(
      { team_id: app.team_id, user_id: app.user_id, role: "pilota" },
      { onConflict: "team_id,user_id" }
    );

    await awardXp(app.user_id, "team_join", app.team_id);

    // notify applicant
    await notify({
      user_id: app.user_id,
      type: "application_accepted",
      title: "Candidatura accettata!",
      body: `Sei stato accettato nel team ${team.name}.`,
      link: `/team/${team.slug}`,
    });

    // send email
    if (applicantEmail) {
      await sendApplicationAccepted({
        to: applicantEmail,
        pilotName,
        teamName: team.name,
        teamSlug: team.slug,
      }).catch(() => {});
    }
  } else {
    // notify rejection
    await notify({
      user_id: app.user_id,
      type: "application_rejected",
      title: "Candidatura non accettata",
      body: `La tua candidatura al team ${team.name} non è andata a buon fine.`,
      link: `/team/${team.slug}`,
    });

    // send email
    if (applicantEmail) {
      await sendApplicationRejected({
        to: applicantEmail,
        pilotName,
        teamName: team.name,
      }).catch(() => {});
    }
  }

  revalidatePath(`/team/${team.slug}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function kickMember(teamId: string, userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const { data: team } = await supabase.from("teams").select("owner_id").eq("id", teamId).single();
  if (!team || team.owner_id !== user.id) return { error: "Non autorizzato" };
  if (userId === user.id) return { error: "Non puoi rimuovere te stesso" };

  const { error } = await supabase.from("team_members").delete().eq("team_id", teamId).eq("user_id", userId);
  if (error) {
    console.error("kickMember failed:", error.message);
    return { error: GENERIC_ERROR };
  }

  await revokeXp(userId, "team_join", teamId);

  revalidatePath(`/team`);
  return { ok: true };
}

export async function leaveTeam(teamId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };
  const { error } = await supabase.from("team_members").delete().eq("team_id", teamId).eq("user_id", user.id);
  if (error) {
    console.error("leaveTeam failed:", error.message);
    return { error: GENERIC_ERROR };
  }
  await revokeXp(user.id, "team_join", teamId);
  revalidatePath(`/team`);
  return { ok: true };
}
