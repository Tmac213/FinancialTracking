import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

/**
 * Popover component based on shadcn/ui implementation using Radix UI.
 * It provides the context needed by PopoverTrigger and PopoverContent.
 */
export const Popover = ({
  children,
  ...props
}: PopoverPrimitive.PopoverProps & { children: React.ReactNode }) => {
  return <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>;
};

/**
 * Wrapper for the trigger element. When `asChild` is true, the child element
 * receives the popover trigger props via `asChild` behavior of Radix.
 */
export const PopoverTrigger = ({
  children,
  asChild = false,
}: {
  children: React.ReactElement;
  asChild?: boolean;
}) => {
  return (
    <PopoverPrimitive.Trigger asChild={asChild}>
      {children}
    </PopoverPrimitive.Trigger>
  );
};

/**
 * Content of the popover. Accepts className for styling and forwards other
 * props to the underlying Radix Popover.Content component.
 */
export const PopoverContent = ({
  children,
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
  className?: string;
}) => {
  return (
    <PopoverPrimitive.Content
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "bg-popover text-popover-foreground rounded-md p-4 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </PopoverPrimitive.Content>
  );
};
