"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

export const COUNTRIES: { code: string; name: string }[] = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AR", name: "Argentina" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgio" },
  { code: "BR", name: "Brasile" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Cile" },
  { code: "CN", name: "Cina" },
  { code: "CO", name: "Colombia" },
  { code: "HR", name: "Croazia" },
  { code: "CZ", name: "Repubblica Ceca" },
  { code: "DK", name: "Danimarca" },
  { code: "EG", name: "Egitto" },
  { code: "FI", name: "Finlandia" },
  { code: "FR", name: "Francia" },
  { code: "DE", name: "Germania" },
  { code: "GR", name: "Grecia" },
  { code: "HU", name: "Ungheria" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IE", name: "Irlanda" },
  { code: "IL", name: "Israele" },
  { code: "IT", name: "Italia" },
  { code: "JP", name: "Giappone" },
  { code: "MX", name: "Messico" },
  { code: "NL", name: "Paesi Bassi" },
  { code: "NZ", name: "Nuova Zelanda" },
  { code: "NO", name: "Norvegia" },
  { code: "PL", name: "Polonia" },
  { code: "PT", name: "Portogallo" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "SA", name: "Arabia Saudita" },
  { code: "RS", name: "Serbia" },
  { code: "SK", name: "Slovacchia" },
  { code: "SI", name: "Slovenia" },
  { code: "ZA", name: "Sudafrica" },
  { code: "KR", name: "Corea del Sud" },
  { code: "ES", name: "Spagna" },
  { code: "SE", name: "Svezia" },
  { code: "CH", name: "Svizzera" },
  { code: "TR", name: "Turchia" },
  { code: "UA", name: "Ucraina" },
  { code: "GB", name: "Regno Unito" },
  { code: "US", name: "Stati Uniti" },
  { code: "VE", name: "Venezuela" },
];

export function codeToFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397));
}

export function CountrySelect({ defaultValue = "IT", name = "country" }: { defaultValue?: string; name?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value) ?? { code: value, name: value };
  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.code.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  return (
    <div ref={ref} className="relative max-w-xs">
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setQuery(""); }}
        className="flex items-center gap-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 py-2 text-sm text-[var(--color-fg)] hover:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-colors"
      >
        <span className="text-xl leading-none">{codeToFlag(selected.code)}</span>
        <span className="flex-1 text-left">{selected.name}</span>
        <ChevronDown className={`w-4 h-4 text-[var(--color-fg-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)]">
            <Search className="w-3.5 h-3.5 text-[var(--color-fg-muted)] shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca paese..."
              className="flex-1 bg-transparent text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-muted)] outline-none"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-[var(--color-fg-muted)]">Nessun risultato</li>
            )}
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => { setValue(c.code); setOpen(false); }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-[var(--color-primary)]/10 transition-colors ${value === c.code ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]" : "text-[var(--color-fg)]"}`}
                >
                  <span className="text-lg leading-none">{codeToFlag(c.code)}</span>
                  <span>{c.name}</span>
                  <span className="ml-auto text-xs text-[var(--color-fg-muted)]">{c.code}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
