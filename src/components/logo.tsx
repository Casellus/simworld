import Link from "next/link";

export function Logo({
  size = "md",
  href = "/",
}: {
  size?: "sm" | "md";
  href?: string | null;
}) {
  const textSize = size === "sm" ? "text-base" : "text-lg";

  const content = (
    <span
      className={`${textSize} font-extrabold tracking-tight`}
      style={{ fontFamily: "var(--font-heading)" }}
    >
      Sim<span className="text-[var(--color-primary)]">Universe</span>
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} className="flex items-center group">
      {content}
    </Link>
  );
}
