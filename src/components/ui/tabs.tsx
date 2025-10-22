
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    width: 0,
    transform: "translateX(0px)",
  });
  const value = props.value;

  React.useLayoutEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const activeTab = listElement.querySelector<HTMLButtonElement>(
      '[data-state="active"]'
    );
    if (activeTab) {
      setIndicatorStyle({
        width: activeTab.offsetWidth,
        transform: `translateX(${activeTab.offsetLeft}px)`,
      });
    }
    
    const resizeObserver = new ResizeObserver(() => {
        const activeTab = listElement.querySelector<HTMLButtonElement>(
            '[data-state="active"]'
        );
        if (activeTab) {
            setIndicatorStyle({
                width: activeTab.offsetWidth,
                transform: `translateX(${activeTab.offsetLeft}px)`,
            });
        }
    });
    
    resizeObserver.observe(listElement);

    return () => {
        resizeObserver.disconnect();
    };

  }, [children, value]);


  return (
    <div className="relative border-b border-divider">
      <TabsPrimitive.List
        ref={listRef}
        className={cn(
          "inline-flex items-center justify-center bg-transparent p-0 text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
      <div
        className="absolute bottom-[-1px] h-0.5 bg-primary transition-all duration-300 ease-in-out"
        style={indicatorStyle}
      />
    </div>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-none bg-transparent px-4 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary data-[state=active]:shadow-none",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
