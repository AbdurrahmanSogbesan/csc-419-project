import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Eye, EyeOff } from "lucide-react";

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { containerClassName?: string }
>(({ className, type, containerClassName, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className={cn("relative", containerClassName)}>
      <input
        type={type === "password" && visible ? "text" : type}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-300 bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          type === "password" && "pr-11",
          className,
        )}
        ref={ref}
        {...props}
      />
      {type === "password" && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => setVisible(!visible)}
        >
          {visible ? <Eye /> : <EyeOff />}
        </Button>
      )}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
