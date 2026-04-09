"use client";

import { ExternalLink } from "lucide-react";

const LINKS = [
  {
    href: "https://drive.google.com/drive/folders/1ZUnI2iQUPp4R7CZ49BRXxPURK0UwaWJp",
    label: "Trip Files (Google Drive)",
    emoji: "📁",
  },
  {
    href: "https://wanderlog.com/plan/ktjcyxxyeodikoxk/trip-to-china",
    label: "Trip Map (Wanderlog)",
    emoji: "🗺️",
  },
];

export function QuickLinks() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-china-red hover:text-china-red transition-colors whitespace-nowrap"
        >
          <span>{link.emoji}</span>
          <span>{link.label}</span>
          <ExternalLink className="h-3 w-3 opacity-50" />
        </a>
      ))}
    </div>
  );
}
