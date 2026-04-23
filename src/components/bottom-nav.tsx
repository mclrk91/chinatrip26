"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, PlusCircle, Settings, BadgeCheck } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Itinerary", icon: CalendarDays },
  { href: "/upload", label: "Add Booking", icon: PlusCircle },
  { href: "/loyalty", label: "Numbers", icon: BadgeCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname.startsWith("/test-")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "#C41E3A",
        boxShadow: "0 -6px 20px rgba(196, 30, 58, 0.22)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        minHeight: 96,
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
                padding: "14px 16px 10px",
                minWidth: 88,
                minHeight: 76,
                color: "#ffffff",
                opacity: isActive ? 1 : 0.78,
                position: "relative",
              }}
            >
              <Icon style={{ width: 26, height: 26 }} />
              <span
                style={{
                  fontSize: 12,
                  marginTop: 5,
                  fontWeight: isActive ? 800 : 600,
                  letterSpacing: "0.04em",
                }}
              >
                {item.label}
              </span>
              {isActive && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    bottom: 6,
                    width: 22,
                    height: 3,
                    borderRadius: 2,
                    background: "#ffffff",
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
