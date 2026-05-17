import Link from "next/link";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="SimUniverse"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sw-logo-grad" x1="2" y1="4" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2e7dff" />
          <stop offset="1" stopColor="#00e0ff" />
        </linearGradient>
      </defs>
      {/* orbit — "Universe" */}
      <ellipse
        cx="16"
        cy="16"
        rx="13"
        ry="6.4"
        transform="rotate(-32 16 16)"
        stroke="url(#sw-logo-grad)"
        strokeWidth="2.4"
      />
      {/* apex / speed line — "Sim" racing */}
      <path
        d="M7 22.5 L17.5 8.5"
        stroke="url(#sw-logo-grad)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      {/* apex point */}
      <circle cx="21.5" cy="11" r="3.1" fill="url(#sw-logo-grad)" />
    </svg>
  );
}

export function Logo({
  size = "md",
  href = "/",
}: {
  size?: "sm" | "md";
  href?: string | null;
}) {
  const markSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const textSize = size === "sm" ? "text-base" : "text-lg";

  const content = (
    <span className="flex items-center gap-2">
      <LogoMark className={markSize} />
      <span
        className={`${textSize} font-extrabold tracking-tight`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Sim<span className="text-[var(--color-primary)]">Universe</span>
      </span>
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} className="flex items-center group">
      {content}
    </Link>
  );
}
