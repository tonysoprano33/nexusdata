"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card relative flex flex-col gap-4 overflow-hidden rounded-sm bg-black p-6 text-sm ring-1 ring-zinc-900 shadow-none transition-all duration-300 hover:ring-zinc-800",
        size === "sm" && "gap-2 p-4",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 mb-2", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-bold text-[10px] tracking-[0.2em] text-zinc-500 uppercase",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs text-zinc-400 font-medium leading-relaxed", className)}
      {...props}
    />
  )
}

function CardInsight({ className, children, label, variant = "default", ...props }: React.ComponentProps<"div"> & { label?: string, variant?: "default" | "critical" | "success" }) {
  const variantStyles = {
    default: "border-zinc-900 bg-zinc-950 text-zinc-300",
    critical: "border-red-900/30 bg-red-950/10 text-red-400",
    success: "border-emerald-900/30 bg-emerald-950/10 text-emerald-400",
  };

  return (
    <div className={cn("mt-4 flex flex-col gap-1 rounded border px-3 py-2", variantStyles[variant], className)} {...props}>
      {label && <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{label}</span>}
      <div className="text-[13px] font-semibold tracking-tight leading-relaxed">{children}</div>
    </div>
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("relative z-10", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center pt-4 border-t border-zinc-900 mt-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardInsight
}
