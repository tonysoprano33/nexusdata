"use client";

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface CardProps extends HTMLMotionProps<"div"> {
  size?: "default" | "sm"
  interactive?: boolean
}

function Card({
  className,
  size = "default",
  interactive = true,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={interactive ? { y: -4, transition: { duration: 0.2 } } : {}}
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-zinc-950/50 p-6 text-sm ring-1 ring-white/[0.08] backdrop-blur-md transition-all duration-300 hover:ring-white/[0.15] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
        size === "sm" && "gap-3 p-4",
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
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-semibold text-lg tracking-tight text-white group-data-[size=sm]/card:text-base",
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
      className={cn("text-sm text-zinc-400 font-medium leading-relaxed", className)}
      {...props}
    />
  )
}

function CardInsight({ className, children, label, ...props }: React.ComponentProps<"div"> & { label?: string }) {
  return (
    <div className={cn("mt-2 flex items-center gap-2 rounded-lg bg-blue-500/5 px-3 py-2 border border-blue-500/10", className)} {...props}>
      {label && <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80">{label}:</span>}
      <div className="text-sm font-semibold text-blue-100">{children}</div>
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
        "flex items-center pt-4 border-t border-white/[0.05] mt-auto",
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
