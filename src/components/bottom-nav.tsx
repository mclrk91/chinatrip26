"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, PlusCircle, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Itinerary", icon: CalendarDays },
  { href: "/upload", label: "Add Booking", icon: PlusCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname.startsWith("/test-")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(245, 240, 235, 0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid var(--paper-400)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        minHeight: 80,
      }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center transition-colors"
              style={{
                padding: "10px 16px",
                minWidth: 88,
                minHeight: 64,
                color: isActive ? "#C41E3A" : "var(--ink-500)",
              }}
            >
              <Icon style={{ width: 24, height: 24 }} />
              <span
                style={{
                  fontSize: 12,
                  marginTop: 4,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
