"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Calendar, PlusCircle, Search, Wrench } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Itinerary", icon: CalendarDays },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/upload", label: "Upload", icon: PlusCircle },
  { href: "/search", label: "Search/AI", icon: Search },
  { href: "/tools", label: "Tools", icon: Wrench },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show on login or test pages
  if (pathname === "/login" || pathname.startsWith("/test-")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-2 min-w-[64px] min-h-[56px] transition-colors ${
                isActive ? "text-china-red" : "text-muted-foreground hover:text-near-black"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
