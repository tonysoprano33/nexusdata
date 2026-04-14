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
  Search,
  LogOut,
  HelpCircle
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

export function EnterpriseSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {      
  const pathname = usePathname();

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }} 
      className="fixed left-0 top-0 z-40 h-screen bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col shadow-2xl shadow-black/50 overflow-hidden"
    >
      {/* Brand Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06]">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="text-white w-4.5 h-4.5" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">NexusData AI</span>
            </motion.div>
          ) : (
             <motion.div
              key="logo-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="text-white w-4.5 h-4.5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <button 
            onClick={onToggle} 
            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-neutral-500 hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Toggle for Collapsed State */}
      {collapsed && (
        <div className="flex justify-center py-4">
           <button 
            onClick={onToggle} 
            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-neutral-500 hover:text-white transition-all active:scale-90 border border-white/5 bg-white/[0.02]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all relative group",
                    isActive 
                      ? "bg-blue-600/10 text-blue-400 font-bold border border-blue-600/20 shadow-lg shadow-blue-600/5" 
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.06] font-medium"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-blue-400" : "group-hover:scale-110 transition-transform")} />
                  {!collapsed && <span className="text-sm tracking-wide">{item.name}</span>}
                  
                  {/* Indicator for Active */}
                  {isActive && !collapsed && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute left-0 w-1 h-5 bg-blue-600 rounded-r-full"
                    />
                  )}
                  
                  {/* Tooltip for collapsed mode */}
                  {collapsed && (
                    <div className="absolute left-16 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                      {item.name}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/[0.06] space-y-2">
        {!collapsed && (
          <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">John Doe</p>
                <p className="text-[10px] text-neutral-500 truncate">Pro Account</p>
              </div>
            </div>
          </div>
        )}

        <button className={cn(
          "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-all",
          collapsed && "justify-center"
        )}>
          <HelpCircle className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Support</span>}
        </button>
        
        <button className={cn(
          "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-400/5 transition-all",
          collapsed && "justify-center"
        )}>
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
