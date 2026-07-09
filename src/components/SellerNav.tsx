"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Tag, BarChart3, Zap } from "lucide-react";

export default function SellerNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Returns Dashboard", href: "/seller/returns", icon: Layers },
    { name: "My Listings", href: "/seller/listings", icon: Tag },
    { name: "Analytics", href: "/seller/analytics", icon: BarChart3 },
    { name: "Automation", href: "/seller/automation", icon: Zap },
  ];

  return (
    <div className="flex gap-2 mb-8 border-b border-gray-200 pb-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${
              isActive 
                ? "bg-gray-100 text-gray-900 border-b-2 border-gray-900" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
