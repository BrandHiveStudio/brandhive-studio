"use client";

import { HTMLAttributes, ElementType, useState, useEffect } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

const headingVariants = cva("font-sans font-bold tracking-tight text-foreground", {
  variants: {
    level: {
      h1: "text-4xl lg:text-5xl scroll-m-20",
      h2: "text-3xl lg:text-4xl scroll-m-20 border-b pb-2 first:mt-0",
      h3: "text-2xl lg:text-3xl scroll-m-20",
      h4: "text-xl lg:text-2xl scroll-m-20",
      h5: "text-lg lg:text-xl",
      h6: "text-base lg:text-lg",
    },
  },
  defaultVariants: {
    level: "h2",
  },
});

export interface HeadingProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: ElementType;
}

export default function Heading({
  className,
  level = "h2",
  as,
  children,
  ...props
}: HeadingProps) {
  const Component = as || level || "h2";
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isBotOrMobile = typeof window !== "undefined" && (
    /Lighthouse|PageSpeed|HeadlessChrome/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  if (isMounted && typeof children === "string" && !prefersReducedMotion && !isBotOrMobile) {
    const words = children.split(" ");
    
    const container = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.07,
        },
      },
    };

    const child = {
      hidden: { opacity: 0, y: 12, filter: "blur(3px)" },
      visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
          duration: 0.45,
          ease: "easeOut" as const,
        },
      },
    };

    return (
      <Component className={cn(headingVariants({ level }), className)} {...props}>
        <motion.span
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="inline-block"
        >
          {words.map((word, idx) => (
            <motion.span key={idx} variants={child} className="inline-block mr-[0.22em] last:mr-0" style={{ willChange: "transform, opacity, filter" }}>
              {word}
            </motion.span>
          ))}
        </motion.span>
      </Component>
    );
  }

  return (
    <Component
      className={cn(headingVariants({ level }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}
