"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type TabsContextValue = {
  value: string
  setValue: (nextValue: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext(component: string) {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error(`${component} must be used within Tabs`)
  }

  return context
}

type TabsProps = React.ComponentPropsWithoutRef<"div"> & {
  defaultValue?: string
  onValueChange?: (value: string) => void
  value?: string
}

function Tabs({ className, defaultValue, onValueChange, value: controlledValue, ...props }: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? "")
  const value = controlledValue ?? uncontrolledValue

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(nextValue)
      }

      onValueChange?.(nextValue)
    },
    [controlledValue, onValueChange]
  )

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("space-y-2", className)} {...props} />
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

type TabsTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, onClick, value, ...props }, ref) => {
    const context = useTabsContext("TabsTrigger")
    const isActive = context.value === value

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
          className
        )}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented) {
            context.setValue(value)
          }
        }}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

type TabsContentProps = React.ComponentPropsWithoutRef<"div"> & {
  forceMount?: boolean
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, forceMount = false, value, ...props }, ref) => {
    const context = useTabsContext("TabsContent")
    const isActive = context.value === value

    if (!forceMount && !isActive) {
      return null
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        hidden={!isActive}
        data-state={isActive ? "active" : "inactive"}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
