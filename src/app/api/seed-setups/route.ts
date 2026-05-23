import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();

  const { data: profiles } = await supabase.from("profiles").select("id, username").limit(10);
  const { data: games } = await supabase.from("games").select("id, slug");

  if (!profiles?.length || !games?.length)
    return NextResponse.json({ error: "Nessun utente o gioco trovato", profiles, games });

  const gm = Object.fromEntries(games.map((g) => [g.slug, g.id]));
  const uids = profiles.map((p) => p.id);
  const uid = (i: number) => uids[i % uids.length];

  const setups = [
    {
      user_id: uid(0),
      game_id: gm["acc"],
      setup_type: "auto",
      title: "Ferrari 296 GT3 – Monza Qualifying",
      car: "Ferrari 296 GT3",
      track: "Monza",
      conditions: "Asciutto 28°C – Qualifica",
      photo_url: "/setup-photos/ferrari-296-gt3.jpg",
      notes: `Setup ottimizzato per la qualifica a Monza. Bassa resistenza aerodinamica per massimizzare la velocità sui lunghi rettilinei.

🔧 AERODINAMICA
Wing: 1 (minima deportanza) | Splitter: 0

🛞 GOMME (DHE – Slick)
Pressione ant/post: 27.5 / 27.3 PSI — Temp. target: 80–90°C

⚙️ ASSETTO
Altezza ant/post: 70 / 82 mm
ARB ant/post: 4 / 5
Campanatura ant/post: -2.8° / -1.9°
Convergenza ant/post: 0.08° / 0.18°

🔁 DIFFERENZIALE
Power: 55% | Coast: 35%

⛽ CARBURANTE: 25L (1 lancio + giro caldo)

Lap di riferimento: 1:46.4 — testato nel campionato SimUniverse GT Sprint Series.`,
    },
    {
      user_id: uid(1),
      game_id: gm["acc"],
      setup_type: "auto",
      title: "Porsche 992 GT3 R – Spa Gara",
      car: "Porsche 992 GT3 R",
      track: "Spa-Francorchamps",
      conditions: "Asciutto 22°C – Gara",
      photo_url: "/setup-photos/porsche-911-gt3rs.jpg",
      notes: `Setup gara per Spa. Bilanciato tra stabilità ad alta velocità e rotazione nelle curve lente del terzo settore.

🔧 AERODINAMICA
Wing: 6 | Splitter: 2 — alto carico per Eau Rouge / Raidillon

🛞 GOMME
Pressione ant/post: 27.0 / 26.8 PSI
Stint di riferimento: 27 giri in DHE2

⚙️ ASSETTO
Altezza ant/post: 68 / 80 mm
ARB ant/post: 3 / 4
Campanatura ant/post: -3.0° / -1.8°
Convergenza ant/post: 0.06° / 0.20°

🔁 DIFFERENZIALE
Power: 60% | Coast: 42% | Preload: 28 Nm

⛽ CARBURANTE: 90L (doppio stint con pitstop al 27°)

Note: setup progettato per preservare le gomme posteriori nel lungo stint finale. Fonte dati telemetrici: popometer.io`,
    },
    {
      user_id: uid(2),
      game_id: gm["acc"],
      setup_type: "auto",
      title: "BMW M4 GT3 – Nürburgring GP Race",
      car: "BMW M4 GT3",
      track: "Nürburgring GP",
      conditions: "Asciutto 20°C – Gara",
      photo_url: "/setup-photos/bmw-m4-gt3.jpg",
      notes: `Setup ottimale per il Nürburgring GP. La BMW M4 GT3 richiede buona trazione e stabilità in frenata per il lento tornante della chicane.

🔧 AERODINAMICA
Wing: 5 | Splitter: 2

🛞 GOMME
Pressione ant/post: 27.2 / 27.0 PSI — DHE2

⚙️ ASSETTO
Altezza ant/post: 66 / 78 mm
ARB ant/post: 5 / 5
Campanatura ant/post: -3.1° / -2.0°
Convergenza ant/post: 0.07° / 0.22°

🔁 DIFFERENZIALE
Power: 58% | Coast: 38%

Freni: Balance 56.5% anteriore | BB: 0

⛽ CARBURANTE: 65L (monostint 35 min)

Lap di riferimento: 1:58.8 — testato in allenamento SimUniverse.`,
    },
    {
      user_id: uid(0),
      game_id: gm["acc"],
      setup_type: "auto",
      title: "McLaren 720S GT3 Evo – Silverstone Qualy",
      car: "McLaren 720S GT3 Evo",
      track: "Silverstone",
      conditions: "Asciutto 18°C – Qualifica",
      photo_url: "/setup-photos/mclaren-720s-gt3.jpg",
      notes: `Setup qualifica per Silverstone. La McLaren brilla nelle curve veloci di Maggotts-Becketts-Chapel e nel complesso Abbey.

🔧 AERODINAMICA
Wing: 4 | Splitter: 1 — bilanciamento tra Copse e rettilineo Hangar

🛞 GOMME
Pressione ant/post: 27.6 / 27.4 PSI — DHE
1 giro di riscaldamento sufficiente con guida aggressiva

⚙️ ASSETTO
Altezza ant/post: 65 / 76 mm
ARB ant/post: 3 / 4
Campanatura ant/post: -3.2° / -1.9°

🔁 DIFFERENZIALE
Power: 52% | Coast: 32%

⛽ CARBURANTE: 22L

Tempo di riferimento: 1:58.1 con gomme nuove DHE. Setup condiviso dopo il campionato SimUniverse British Cup.`,
    },
    {
      user_id: uid(1),
      game_id: gm["ac"],
      setup_type: "auto",
      title: "Ferrari F2004 – Monza Time Attack",
      car: "Ferrari F2004",
      track: "Monza",
      conditions: "Asciutto – Time Attack",
      photo_url: "/setup-photos/ferrari-f2004.jpg",
      notes: `Setup estremo per il time attack a Monza con la leggendaria Ferrari F2004. Oltre 350 km/h sul rettilineo principale!

🔧 AERODINAMICA
Wing anteriore: 1 (minimo assoluto)
Wing posteriore: 2
Resistenza ridotta al massimo per velocità di punta massima

🛞 GOMME
Pressione ant: 19.0 PSI | Post: 19.5 PSI
Slick Pirelli morbide — riscaldamento in 2 giri veloci

⚙️ ASSETTO
Altezza ant/post: 45 / 55 mm
ARB ant/post: 5 / 7 (rigido – massima risposta)
Campanatura ant/post: -3.5° / -1.5°

🔁 DIFFERENZIALE
Power: 35% | Coast: 5% (comportamento F1 originale 2004)

⛽ CARBURANTE: 10L (solo giro caldo)

⚠️ Attenzione: la F2004 è nervosa a bassa velocità. Setup per piloti esperti.`,
    },
    {
      user_id: uid(2),
      game_id: gm["acc"],
      setup_type: "auto",
      title: "Lamborghini Huracán GT3 Evo2 – Valencia",
      car: "Lamborghini Huracán GT3 Evo2",
      track: "Valencia",
      conditions: "Asciutto 32°C – Gara",
      photo_url: "/setup-photos/lamborghini-huracan.jpg",
      notes: `Setup gara per Valencia con la Huracán Evo2. Caldo intenso — pressioni gomme ridotte per compensare l'espansione termica.

🔧 AERODINAMICA
Wing: 7 | Splitter: 3 — alta deportanza per le curve tecniche

🛞 GOMME
Pressione ant/post: 26.5 / 26.3 PSI (ridotte per alte temperature)
DHE2 — strategia 2 stint

⚙️ ASSETTO
Altezza ant/post: 72 / 84 mm
ARB ant/post: 4 / 6
Campanatura ant/post: -2.9° / -1.8°
Convergenza ant/post: 0.09° / 0.24°

🔁 DIFFERENZIALE
Power: 62% | Coast: 45% | Preload: 25 Nm

⛽ CARBURANTE: 85L (pitstop previsto al 35° giro)

Testato nella SimUniverse Racing League – DTM Sprint Season 2. Setup condiviso dopo la vittoria in Gara 1.`,
    },
  ];

  const results = [];
  for (const s of setups) {
    if (!s.game_id) { results.push({ title: s.title, error: "gioco non trovato nel DB" }); continue; }
    const { data, error } = await supabase.from("setups").insert(s).select("id, title").single();
    results.push({ title: s.title, id: data?.id, error: error?.message ?? null });
  }

  return NextResponse.json({ created: results.filter((r) => r.id).length, results });
}
