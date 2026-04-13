"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Database,
  Brain,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Datasets", href: "/datasets", icon: Database },
  { name: "Intelligence", href: "/intelligence", icon: Brain },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface EnterpriseSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function EnterpriseSidebar({ collapsed, onToggle }: EnterpriseSidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen",
        "bg-[#0a0a0a] border-r border-white/[0.08]",
        "flex flex-col"
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08]">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white text-sm tracking-tight">
                Nexus<span className="text-blue-400">AI</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-neutral-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-white/[0.06] group",
                    isActive 
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive ? "text-blue-400" : "group-hover:text-white"
                  )} />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/[0.08]">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
            JD
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-white truncate">John Doe</p>
              <p className="text-xs text-neutral-500 truncate">Data Analyst</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
