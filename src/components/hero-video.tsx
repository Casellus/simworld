"use client";

import { useEffect, useRef } from "react";

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const tryPlay = () => {
      v.play().catch(() => {});
    };
    tryPlay();
    // Mobile browsers may defer autoplay until the video can play or the
    // tab becomes visible — retry on those events.
    v.addEventListener("canplay", tryPlay);
    document.addEventListener("visibilitychange", tryPlay);
    return () => {
      v.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", tryPlay);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="hero-video"
      src="/video-homepage.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
