"use client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Database, Brain, FileText, Settings, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Datasets", href: "/datasets", icon: Database },
  { name: "Intelligence", href: "/intelligence", icon: Brain },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function EnterpriseSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  return (
    <motion.aside animate={{ width: collapsed ? 80 : 260 }} className="fixed left-0 top-0 z-40 h-screen bg-[#0a0a0a] border-r border-white/[0.08] flex flex-col">
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08]">
        {!collapsed && <span className="font-bold text-white text-sm tracking-tight flex items-center gap-2"><Sparkles className="text-blue-400 w-4 h-4"/> NexusAI</span>}
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-white/[0.08]"><ChevronRight className={cn("w-4 h-4 text-neutral-400 transition-transform", !collapsed && "rotate-180")} /></button>
      </div>
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link href={item.href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all", pathname === item.href ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-neutral-400 hover:text-white hover:bg-white/[0.06]")}>
                <item.icon className="w-5 h-5" />
                {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </motion.aside>
  );
}
