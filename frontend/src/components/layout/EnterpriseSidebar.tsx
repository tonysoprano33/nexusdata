"use client";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Database, Brain, FileText, Settings, ChevronLeft, ChevronRight, BriefcaseBusiness, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Datasets", href: "/datasets", icon: Database },
  { name: "Intelligence", href: "/intelligence", icon: Brain },
  { name: "Case Study", href: "/case-study", icon: BriefcaseBusiness },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function EnterpriseSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {      
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-black border-r border-zinc-900 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="h-14 flex items-center px-6 border-b border-zinc-900">
        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center shrink-0">
          <Database className="w-3 h-3 text-black fill-current" />
        </div>
        {!collapsed && <span className="ml-3 font-bold text-xs uppercase tracking-[0.2em]">NexusData</span>}
      </div>

      <nav className="py-6 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));   
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center h-10 px-3 rounded-sm transition-colors",
                isActive ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="ml-3 text-[13px] font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full p-3 space-y-1 border-t border-zinc-900">
        <button className={cn("flex items-center h-10 w-full px-3 text-zinc-500 hover:text-white rounded-sm", collapsed && "justify-center")}>
          <Shield className="w-4 h-4" />
          {!collapsed && <span className="ml-3 text-[11px] font-bold uppercase tracking-widest">Security</span>}
        </button>
        <button onClick={onToggle} className="flex items-center h-10 w-full px-3 text-zinc-500 hover:text-white rounded-sm">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="ml-3 text-[11px] font-bold uppercase tracking-widest">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
