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

  // Don't show on login or test pages
  if (pathname === "/login" || pathname.startsWith("/test-")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around max-w-2xl mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-4 min-w-[80px] min-h-[56px] rounded-lg transition-all active:scale-90 active:bg-gray-100 ${
                isActive ? "text-china-red bg-red-50" : "text-muted-foreground hover:text-near-black"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
