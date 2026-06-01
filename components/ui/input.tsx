"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";
import { useTheme } from "next-themes";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const radius = 250;
    const [visible, setVisible] = React.useState(false);

    //  Usamos 'resolvedTheme' que es más preciso para saber si es claro u oscuro
    const { resolvedTheme } = useTheme(); 
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const isLight = mounted && resolvedTheme === "light";
    const activeColor = isLight ? "rgba(34, 197, 94, 0.85)" : "rgba(50, 117, 248, 0.6)";
    const fadeColor = isLight ? "rgba(34, 197, 94, 0)" : "rgba(50, 117, 248, 0)";

    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: any) {
      let { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <motion.div
        style={{
          backgroundImage: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
          ${activeColor},
          ${fadeColor} 80%
        )
      `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}

        className="group/input rounded-lg p-[2px] transition duration-300 bg-[#eef4ff] dark:bg-zinc-900"
      >
        <input
          type={type}
          className={cn(
            `shadow-input dark:placeholder-text-neutral-600 flex h-10 w-full rounded-md border-none px-3 py-2 text-sm text-black transition duration-400 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600 group-hover/input:shadow-none`,
            
            `bg-[#eef4ff] group-hover/input:bg-transparent dark:bg-zinc-900 dark:group-hover/input:bg-transparent`,
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  }
);
Input.displayName = "Input";

export { Input };