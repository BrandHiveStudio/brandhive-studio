"use client";

import React, { useState, forwardRef, InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  hasLeftLockIcon?: boolean;
  iconSize?: "sm" | "md";
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      hasLeftLockIcon = false,
      iconSize = "md",
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isSmall = iconSize === "sm";

    return (
      <div className="relative w-full">
        {hasLeftLockIcon && (
          <Lock
            className={cn(
              "text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none",
              isSmall ? "size-3.5" : "size-4"
            )}
          />
        )}
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          disabled={disabled}
          className={cn(
            "w-full rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#16C7FF] transition-colors",
            hasLeftLockIcon ? "pl-10" : "pl-3.5",
            isSmall
              ? "pr-9 py-2 text-xs"
              : "pr-10 py-2.5 text-sm focus:ring-1 focus:ring-[#16C7FF]",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
          tabIndex={0}
          aria-label={showPassword ? "Hide password" : "Show password"}
          title={showPassword ? "Hide password" : "Show password"}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white focus:text-[#16C7FF] focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
            isSmall ? "p-0.5" : "p-1"
          )}
        >
          {showPassword ? (
            <EyeOff className={isSmall ? "size-3.5" : "size-4"} />
          ) : (
            <Eye className={isSmall ? "size-3.5" : "size-4"} />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
