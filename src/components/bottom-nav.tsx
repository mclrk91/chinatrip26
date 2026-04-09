"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, PlusCircle } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Itinerary", icon: CalendarDays },
  { href: "/calendar", label: "Calendar", icon: LayoutGrid },
  { href: "/upload", label: "Upload", icon: PlusCircle },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show on login or test pages
  if (pathname === "/login" || pathname.startsWith("/test-")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-4 min-w-[80px] min-h-[56px] transition-colors ${
                isActive ? "text-china-red" : "text-muted-foreground hover:text-near-black"
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
