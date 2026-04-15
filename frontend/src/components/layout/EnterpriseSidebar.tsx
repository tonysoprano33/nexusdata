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
  HelpCircle,
  Cpu,
  Fingerprint
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/datasets", icon: Database },
  { name: "Intelligence", href: "/intelligence", icon: Brain },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function EnterpriseSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {      
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 88 : 280 }}
      className="fixed left-0 top-0 z-50 h-screen bg-[#030303]/80 backdrop-blur-xl border-r border-white/[0.08] flex flex-col shadow-2xl transition-all duration-500"
    >
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/[0.05]">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-white text-base tracking-tighter uppercase italic">Nexus<span className="text-blue-500">AI</span></span>
            </motion.div>
          ) : (
             <motion.div key="logo-collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="text-white w-5 h-5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));   
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group",
                isActive
                  ? "bg-white/[0.05] text-white border border-white/[0.1] shadow-xl shadow-black/20"
                  : "text-zinc-500 hover:text-white hover:bg-white/[0.03]"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-500", isActive ? "text-blue-400" : "group-hover:scale-110")} />
              {!collapsed && <span className="text-sm font-bold tracking-tight">{item.name}</span>}
              {isActive && (
                <motion.div layoutId="active-nav" className="absolute inset-0 border border-blue-500/20 rounded-2xl pointer-events-none" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/[0.05] space-y-4">
        {!collapsed && (
          <div className="p-4 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] relative group overflow-hidden">
             <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full border border-white/10 p-0.5">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-xs font-black text-white">LT</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white uppercase tracking-widest truncate">Neural Node #82</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Enterprise</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <button className={cn("flex items-center gap-4 w-full px-4 py-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.03] transition-all", collapsed && "justify-center")}>
            <Fingerprint className="w-5 h-5" />
            {!collapsed && <span className="text-xs font-bold uppercase tracking-widest">Security</span>}
          </button>
          <button className={cn("flex items-center gap-4 w-full px-4 py-2.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all", collapsed && "justify-center")}>
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-xs font-bold uppercase tracking-widest">Terminate</span>}
          </button>
        </div>
        
        <button onClick={onToggle} className="mx-auto w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
