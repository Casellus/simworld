// Icona medaglia per rango, colorata col metallo. SVG inline (Tabler MIT).
// Bronzo/Argento/Oro usano la coccarda; Leggenda la corona.

export const RANK_COLORS: Record<string, string> = {
  Bronzo: "#cd7f32",
  Argento: "#c8cdd4",
  Oro: "#ffd23f",
  Leggenda: "#a855f7",
};

const CROWN =
  "M19 19h-14c-.5 0 -.9 -.3 -1 -.8l-2 -10c0 -.4 .1 -.8 .5 -1.1c.4 -.2 .8 -.2 1.1 0l4.1 3.3l3.4 -5.1c.4 -.6 1.3 -.6 1.7 0l3.4 5.1l4.1 -3.3c.3 -.3 .8 -.3 1.1 0c.4 .2 .5 .6 .5 1.1l-2 10c0 .5 -.5 .8 -1 .8z";

// Medaglia vera: nastro a V sopra + disco pieno col colore metallo + stella
// centrale piu' chiara. Costruita a mano (non un'icona a contorno).
function Medal({ color, className }: { color: string; className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {/* nastro */}
      <path d="M8.5 2 L12 9 L9 10.5 L5.5 3.5 Z" fill={color} opacity="0.55" />
      <path d="M15.5 2 L18.5 3.5 L15 10.5 L12 9 Z" fill={color} opacity="0.55" />
      {/* disco */}
      <circle cx="12" cy="15.5" r="6.2" fill={color} />
      {/* stella centrale (piu' chiara) */}
      <path
        d="M12 12.1l1.02 2.07l2.28.33l-1.65 1.61l.39 2.27L12 17.35l-2.04 1.07l.39 -2.27l-1.65 -1.61l2.28 -.33z"
        fill="#0a0a0f"
        opacity="0.35"
      />
    </svg>
  );
}

export function RankMedal({ rank, className = "h-4 w-4" }: { rank: string; className?: string }) {
  const color = RANK_COLORS[rank] ?? RANK_COLORS.Bronzo;
  if (rank === "Leggenda") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill={color} aria-hidden>
        <path d={CROWN} />
      </svg>
    );
  }
  return <Medal color={color} className={className} />;
}
