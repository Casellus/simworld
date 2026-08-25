// Embed video da link YouTube/Vimeo. Estrae l'ID e costruisce l'URL di embed
// dei domini fidati: nessun URL arbitrario finisce in un iframe (no XSS/SSRF).

function parseEmbed(url: string): string | null {
  const u = url.trim();
  try {
    const parsed = new URL(u);
    const host = parsed.hostname.replace(/^www\./, "");

    // YouTube: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, /shorts/ID
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
      }
      const m = parsed.pathname.match(/^\/(embed|shorts)\/([^/?]+)/);
      if (m) return `https://www.youtube.com/embed/${encodeURIComponent(m[2])}`;
      return null;
    }

    // Vimeo: vimeo.com/ID  o player.vimeo.com/video/ID
    if (host === "vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return /^\d+$/.test(id ?? "") ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === "player.vimeo.com") {
      const m = parsed.pathname.match(/^\/video\/(\d+)/);
      return m ? `https://player.vimeo.com/video/${m[1]}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

/** True se l'URL e' un link YouTube/Vimeo embeddabile. */
export function isEmbeddableVideo(url: string): boolean {
  return parseEmbed(url) !== null;
}

/**
 * Thumbnail derivabile dal video, usata come cover automatica.
 * YouTube: si ricava dall'ID senza chiamate esterne. Vimeo richiede una
 * API per la thumb, quindi non e' derivabile qui -> null.
 */
export function videoThumbnail(url: string | null | undefined): string | null {
  if (!url) return null;
  const embed = parseEmbed(url);
  if (!embed) return null;
  const m = embed.match(/youtube\.com\/embed\/([^/?]+)/);
  if (m) return `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`;
  return null;
}

export function VideoEmbed({ url }: { url: string }) {
  const src = parseEmbed(url);
  if (!src) return null;
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[var(--color-border)]" style={{ aspectRatio: "16 / 9" }}>
      <iframe
        src={src}
        title="Video guida"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
