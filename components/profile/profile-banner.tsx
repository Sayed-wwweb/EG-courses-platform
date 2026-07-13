"use client";

import { useEffect, useState } from "react";

interface ProfileBannerProps {
  imageUrl: string | null;
}

const FALLBACK_CLASSES =
  "relative h-36 rounded-b-2xl bg-gradient-to-br from-primary/50 via-primary to-primary/60 sm:h-44";

export function ProfileBanner({ imageUrl }: ProfileBannerProps) {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    let cancelled = false;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      if (cancelled) return;

      try {
        const size = 40;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 100) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        if (count === 0 || cancelled) return;

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        setColor(`rgb(${r}, ${g}, ${b})`);
      } catch (err) {
        // Most likely a CORS issue — the image host isn't allowing pixel reads
        console.error("Avatar color extraction failed:", err);
      }
    };

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  if (color) {
    return (
      <div
        className="relative h-36 rounded-b-2xl sm:h-44"
        style={{
          backgroundImage: `linear-gradient(135deg, ${color}, rgba(0,0,0,0.55))`,
        }}
      />
    );
  }

  return <div className={`relative h-36 rounded-b-2xl sm:h-44 ${FALLBACK_CLASSES}`} />;
}