import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE = "https://simuniverse.it";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1, changeFrequency: "daily" },
    { url: `${BASE}/eventi`, priority: 0.9, changeFrequency: "hourly" },
    { url: `${BASE}/team`, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/assetti`, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/guide`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/cerca`, priority: 0.7, changeFrequency: "hourly" },
    { url: `${BASE}/info/chi-siamo`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/info/privacy`, priority: 0.3, changeFrequency: "monthly" },
    { url: `${BASE}/info/termini`, priority: 0.3, changeFrequency: "monthly" },
    { url: `${BASE}/info/cookie`, priority: 0.3, changeFrequency: "monthly" },
  ];

  const [eventi, team, assetti, guide] = await Promise.all([
    supabase.from("events").select("slug, updated_at").eq("is_public", true),
    supabase.from("teams").select("slug, updated_at").eq("is_public", true),
    supabase.from("setups").select("id, updated_at").eq("is_public", true),
    supabase.from("guides").select("slug, updated_at").eq("is_published", true),
  ]);

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...(eventi.data ?? []).map((e) => ({
      url: `${BASE}/eventi/${e.slug}`,
      lastModified: e.updated_at,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...(team.data ?? []).map((t) => ({
      url: `${BASE}/team/${t.slug}`,
      lastModified: t.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...(assetti.data ?? []).map((s) => ({
      url: `${BASE}/assetti/${s.id}`,
      lastModified: s.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...(guide.data ?? []).map((g) => ({
      url: `${BASE}/guide/${g.slug}`,
      lastModified: g.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
