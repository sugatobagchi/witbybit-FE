"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-start gap-2 rounded-md bg-transparent text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, value, ...props }, ref) => {
  const step = parseInt(props["data-current-step"]); // Current active step
  const tabValue = parseInt(value); // This specific tab's value

  // Determine if this tab and prior tabs are active or not
  const isActive = tabValue <= step;

  return (
    <div className="flex items-center">
      <TabsPrimitive.Trigger
        ref={ref}
        value={value}
        className={cn(
          "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-blue-200 text-blue-600" // Active state styles for current and prior tabs
            : "bg-transparent text-gray-500", // Inactive state styles
          className
        )}
        {...props}
      />
      {/* Arrow (skip on the last tab) */}
      {tabValue < 4 && (
        <span className="mx-2 text-gray-400">→</span> // Add a right arrow between tabs
      )}
    </div>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
