"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, PlusCircle, Search, Wrench } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Itinerary", icon: Home },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/upload", label: "Upload", icon: PlusCircle },
  { href: "/search", label: "Search/AI", icon: Search },
  { href: "/tools", label: "Tools", icon: Wrench },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show on login, test pages, or full-screen overlays
  if (pathname === "/login" || pathname.startsWith("/test-") || pathname === "/show-driver") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around max-w-lg mx-auto" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-2 min-w-[64px] min-h-[56px] transition-colors ${
                isActive ? "text-china-red" : "text-near-black/60 hover:text-near-black"
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "stroke-[2.5px]" : ""}`} />
              <span className={`mt-1 leading-tight ${isActive ? "text-[13px] font-bold" : "text-xs font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
