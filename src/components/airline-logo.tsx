"use client";

import { useState } from "react";
import { Plane } from "lucide-react";

interface AirlineLogoProps {
  iataCode: string;
  size?: number;
  className?: string;
}

export function AirlineLogo({ iataCode, size = 24, className = "" }: AirlineLogoProps) {
  const [error, setError] = useState(false);

  if (error || !iataCode) {
    return <Plane className={`inline-block flex-shrink-0 text-muted-foreground ${className}`} style={{ width: size, height: size }} />;
  }

  return (
    <img
      src={`https://pics.avs.io/${size * 2}/${size * 2}/${iataCode}.png`}
      alt={iataCode}
      width={size}
      height={size}
      className={`inline-block flex-shrink-0 rounded ${className}`}
      onError={() => setError(true)}
    />
  );
}
