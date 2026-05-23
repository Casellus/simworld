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
    // ── ACC ──────────────────────────────────────────────────────────────────
    {
      user_id: uid(0),
      game_id: gm["acc"],
      setup_type: "auto",
      title: "Ferrari 296 GT3 – Monza Qualifica",
      car: "Ferrari 296 GT3",
      track: "Monza",
      conditions: "Asciutto 22°C – Qualifica",
      photo_url: "/setup-photos/ferrari-296-gt3.jpg",
      notes: `Setup qualifica per Monza con la Ferrari 296 GT3. Bassa resistenza aerodinamica per massimizzare la velocità di punta sul rettifilo.

🔧 AERODINAMICA
Wing posteriore: 4° | Splitter: 0

🛞 GOMME (DHE – Slick)
Pressione ant/post: 26.6 / 26.8 PSI — Temp. target: 82–90°C

⚙️ ASSETTO
Altezza ant/post: 60 / 58 mm
ARB ant/post: 5 / 1
Campanatura ant/post: -4.0° / -3.5°
Convergenza ant/post: 0.00° / 0.00°

🔁 DIFFERENZIALE
Preload: 80 Nm

🛑 FRENI
Bias: 58.4% anteriore

⛽ CARBURANTE: 22L (1 lancio + giro caldo)

Lap di riferimento: 1:46.6 — testato nella SimUniverse GT Sprint Series.`,
    },
    {
      user_id: uid(1),
      game_id: gm["acc"],
      setup_type: "auto",
      title: "BMW M4 GT3 – Nürburgring GP Gara",
      car: "BMW M4 GT3",
      track: "Nürburgring GP",
      conditions: "Asciutto 20°C – Gara",
      photo_url: "/setup-photos/bmw-m4-gt3.jpg",
      notes: `Setup gara bilanciato per il Nürburgring GP. La BMW M4 GT3 richiede buona trazione al tornante e stabilità nelle frenate decise della chicane.

🔧 AERODINAMICA
Wing: 5 | Splitter: 2

🛞 GOMME
Pressione ant/post: 27.0 / 26.8 PSI — DHE2
Stint di riferimento: 32 giri con degrado contenuto

⚙️ ASSETTO
Altezza ant/post: 66 / 78 mm
ARB ant/post: 5 / 5
Campanatura ant/post: -3.1° / -2.0°
Convergenza ant/post: 0.07° / 0.22°

🔁 DIFFERENZIALE
Power: 58% | Coast: 38%

🛑 FRENI
Bias: 56.5% anteriore | Pad: MED

⛽ CARBURANTE: 65L (monostint 35 min)

Lap di riferimento: 1:58.8 — testato in allenamento SimUniverse.`,
    },
    {
      user_id: uid(2),
      game_id: gm["acc"],
      setup_type: "auto",
      title: "McLaren 720S GT3 Evo – Spa Gara",
      car: "McLaren 720S GT3 Evo",
      track: "Spa-Francorchamps",
      conditions: "Asciutto 22°C – Gara",
      photo_url: "/setup-photos/mclaren-720s-gt3.jpg",
      notes: `Setup gara per Spa con la 720S GT3 Evo. ARB rigido come da caratteristica della vettura, bump stop abbassati per ridurre il sovrasterzo in uscita.

🔧 AERODINAMICA
Wing: 6 | Splitter: 2 — carico alto per Eau Rouge / Raidillon

🛞 GOMME
Pressione ant/post: 27.5 / 27.8 PSI — DHE2
Temp. target: 85–92°C | Stint: 25 giri

⚙️ ASSETTO
Altezza ant/post: 65 / 76 mm
ARB ant/post: 6 / 6 (rigido – caratteristica 720S)
Campanatura ant/post: -3.2° / -1.9°
Convergenza ant/post: 0.06° / 0.20°
Bump stop ant/post: abbassati per contenere rollio

🔁 DIFFERENZIALE
Power: 52% | Coast: 32%

⛽ CARBURANTE: 90L (doppio stint – pitstop al giro 26)

Fonte: simracingsetup.com + solox.gg. Testato nella SimUniverse Endurance Cup.`,
    },

    // ── iRacing ──────────────────────────────────────────────────────────────
    {
      user_id: uid(0),
      game_id: gm["iracing"],
      setup_type: "auto",
      title: "Porsche 911 GT3 R (992) – Sebring 12h",
      car: "Porsche 911 GT3 R (992)",
      track: "Sebring International Raceway",
      conditions: "Asciutto 28°C – Gara Endurance",
      photo_url: "/setup-photos/porsche-911-gt3rs.jpg",
      notes: `Setup endurance per la 12 ore di Sebring. La Porsche 992 GT3 R richiede pressioni di esercizio sotto 1.55 bar: oltre quella soglia il posteriore diventa instabile.

🔧 AERODINAMICA
Splitter: 3 | Wing: 7 — bilanciamento downforce/drag per i lunghi rettilinei di Sebring

🛞 GOMME (pressioni a caldo)
Pressione ant/post: 31.5 / 32.0 PSI (1.52 / 1.53 bar) — MAX 1.55 bar post
Gonfiaggio a freddo: -3.5 PSI rispetto al target caldo

⚙️ ASSETTO
Molle ant/post: rigide ant, morbide post (bilanciamento SEBRING)
ARB ant/post: rigido ant, morbido post
Campanatura: -3.0° ant / -1.8° post
Bias freni: 54.0% anteriore

🔁 TC/ABS
TC: 4 su asfalto pulito | ABS: 4

⛽ CARBURANTE: 80L (stint da 90 min)

Note: su asfalto bagnato alzare TC a 6 e ridurre pressioni di 1.5 PSI.`,
    },
    {
      user_id: uid(1),
      game_id: gm["iracing"],
      setup_type: "auto",
      title: "Dallara F3 – Suzuka Circuit",
      car: "Dallara F3 2019",
      track: "Suzuka Circuit",
      conditions: "Asciutto 24°C – Qualifica",
      photo_url: "/setup-photos/dallara-f3.jpg",
      notes: `Setup qualifica per Suzuka con la Dallara F3. Maximizza il carico nel primo settore (S/S) e mantiene velocità di punta sul rettifilo del traguardo.

🔧 AERODINAMICA
Ala anteriore: 4 | Ala posteriore: 6
Gurney flap: 2 (aggiunto per il 130R e il Casio Triangle)

🛞 GOMME
Pressione ant/post: 20.0 / 20.5 PSI a freddo
Target caldo: 24.0 / 24.5 PSI

⚙️ ASSETTO
Altezza ant/post: 35 / 40 mm
ARB ant/post: 3 / 5
Campanatura ant/post: -2.5° / -1.2°
Convergenza ant/post: 0.10° / 0.15°
Molle ant: 90 N/mm | post: 75 N/mm

🔁 DIFFERENZIALE
Power: 45% | Coast: 20%

⛽ CARBURANTE: 8L (singolo giro veloce)

Lap di riferimento: 1:56.3 — setup condiviso nella SimUniverse Formula Cup.`,
    },

    // ── AC (Assetto Corsa originale) ──────────────────────────────────────────
    {
      user_id: uid(2),
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

🛞 GOMME (Pirelli Slick Morbide)
Pressione ant/post: 19.0 / 19.5 PSI — riscaldamento in 2 giri veloci
Nota: pressioni minime = comportamento originale F1 2004

⚙️ ASSETTO
Altezza ant/post: 45 / 55 mm
ARB ant/post: 5 / 7 (rigido – massima risposta)
Campanatura ant/post: -3.5° / -1.5°

🔁 DIFFERENZIALE
Power: 35% | Coast: 5% (fedele al setup F1 originale 2004)

🛑 FRENI
Bias: 56% anteriore | Potenza: 95%

⛽ CARBURANTE: 10L (solo giro caldo)

⚠️ Setup per piloti esperti: la F2004 è nervosa sotto i 100 km/h.`,
    },

    // ── LMU (Le Mans Ultimate) ────────────────────────────────────────────────
    {
      user_id: uid(0),
      game_id: gm["lmu"],
      setup_type: "auto",
      title: "Ferrari 499P – Circuit de la Sarthe",
      car: "Ferrari 499P Hypercar",
      track: "Circuit de la Sarthe (Le Mans)",
      conditions: "Asciutto 20°C – Gara 24h",
      photo_url: "/setup-photos/ferrari-499p.jpg",
      notes: `Setup gara 24h per la Ferrari 499P a Le Mans. Compromesso aerodinamico per i lunghi rettilinei Mulsanne/Hunaudières e le curve veloci Porsche.

🔧 AERODINAMICA
Ala anteriore: 3 | Ala posteriore: 4
Deploy ERS: modalità Attack per il rettilineo Hunaudières

🛞 GOMME (Michelin Slick)
Pressione ant/post: 25.5 / 25.8 PSI — Temp. target: 88–96°C
Stint endurance: 50–55 giri (cambio gomme al pitstop)

⚙️ ASSETTO
Altezza ant/post: 70 / 82 mm
ARB ant/post: 3 / 4
Campanatura ant/post: -2.8° / -1.6°
Convergenza ant/post: 0.04° / 0.16°

🔁 DIFFERENZIALE
Power: 50% | Coast: 25% | Preload: 20 Nm

⚡ ERS / IBRIDO
Deploy: 100% sul rettilineo | Ricarica: frenata Mulsanne e Indianapolis
Potenza motore elettrico: 200 kW (regolamento Hypercar LMH)

⛽ CARBURANTE: 75L (stint da 65 min – regolamento WEC 2024)

Setup testato nella SimUniverse Le Mans Endurance Series.`,
    },

    // ── F1 25 ─────────────────────────────────────────────────────────────────
    {
      user_id: uid(1),
      game_id: gm["f1-25"],
      setup_type: "auto",
      title: "F1 Generica – Monaco Gara",
      car: "F1 Car (My Team)",
      track: "Monaco",
      conditions: "Asciutto – Gara",
      photo_url: "/setup-photos/mercedes-w16.jpg",
      notes: `Setup ottimizzato per Monaco in F1 25. Massimo carico aerodinamico per le curve lente e buona trazione in uscita dai tornanti.

🔧 AERODINAMICA
Ala anteriore: 50 | Ala posteriore: 50 — downforce massima

🛞 GOMME
Pressione ant/post: 24.5 / 22.5 PSI
Gomme di partenza: Soft (SC virtuale)

⚙️ ASSETTO
Sospensione ant/post: 41 / 22
ARB ant/post: 3 / 18
Campanatura ant/post: -3.50° / -2.00°
Convergenza ant/post: 0.00° / 0.10°
Altezza ant/post: 19 / 49 mm

🔁 DIFFERENZIALE
On-throttle: 60% | Off-throttle: 15%

🛑 FRENI
Bias: 52% anteriore | Pressione: 100%

⛽ CARBURANTE: Monaco – strategia 1 stop (Medium → Hard)

Note: abbassare l'ala posteriore di 3-5 punti se si perde troppo nelle sezioni ad alta velocità di giorno sul bagnato.`,
    },
    {
      user_id: uid(2),
      game_id: gm["f1-25"],
      setup_type: "auto",
      title: "F1 Generica – Monza Qualifica",
      car: "F1 Car (My Team)",
      track: "Monza",
      conditions: "Asciutto – Qualifica",
      photo_url: "/setup-photos/mercedes-w16.jpg",
      notes: `Setup qualifica per Monza in F1 25. Basso drag per massimizzare la velocità di punta sui rettilinei Principale e Ascari.

🔧 AERODINAMICA
Ala anteriore: 0 | Ala posteriore: 0 — resistenza minima

🛞 GOMME
Pressione: massima consentita dal gioco (Soft nuove per il giro caldo)

⚙️ ASSETTO
Sospensione ant/post: 41 / 1
ARB ant/post: 9 / 21
Campanatura ant/post: -2.50° / -1.00°
Convergenza ant/post: 0.05° / 0.20°
Altezza ant/post: 21 / 49 mm

🔁 DIFFERENZIALE
On-throttle: 75% | Off-throttle: 25%

🛑 FRENI
Bias: 55% anteriore | Pressione: 100%

⛽ CARBURANTE: 5L (singolo giro veloce)

Nota: con questo setup la vettura è nervosa alla Parabolica — tenere la ruota dritta in frenata. Fonte dati: f1laps.com + simracingsetup.com.`,
    },

    // ── AC EVO ────────────────────────────────────────────────────────────────
    {
      user_id: uid(0),
      game_id: gm["ac-evo"],
      setup_type: "auto",
      title: "Audi R8 LMS EVO II – Nürburgring Nordschleife",
      car: "Audi R8 LMS EVO II GT3",
      track: "Nürburgring Nordschleife",
      conditions: "Asciutto 18°C – Hotlap",
      photo_url: "/setup-photos/audi-r8-lms.jpg",
      notes: `Setup hotlap per il Nordschleife con la Audi R8 LMS EVO II. Il circuito richiede un compromesso estremo: setup rigido per le curve veloci, sufficiente corsa per i salti e le irregolarità del manto.

🔧 AERODINAMICA
Wing ant: 3 | Wing post: 5 — downforce media per non perdere sul rettifilo Döttinger Höhe

🛞 GOMME (Slick Morbide)
Pressione ant/post: 27.8 / 27.5 PSI
Temp. target: 78–88°C — il circuito non scalda molto le gomme

⚙️ ASSETTO
Altezza ant/post: 72 / 85 mm (più alta per i dossi)
ARB ant/post: 4 / 4 — sospensioni non troppo rigide per le irregolarità
Campanatura ant/post: -3.0° / -1.8°
Convergenza ant/post: 0.06° / 0.18°
Ammortizzatori: impostazioni morbide per assorbire le irregolarità del tracciato

🔁 DIFFERENZIALE
Power: 55% | Coast: 35%

⛽ CARBURANTE: 40L (giro Nordschleife ~22 km)

⚠️ Setup testato in AC EVO Early Access. Valori soggetti a variazione con i futuri aggiornamenti della fisica.`,
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
