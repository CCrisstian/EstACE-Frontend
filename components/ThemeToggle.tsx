"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Evita errores de hidratación en Next.js
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Definimos en qué páginas va a la izquierda
  const bottomLeftPages = ["/", "/funcionalidades", "/herramientas", "/historia"];
  const isBottomLeft = bottomLeftPages.includes(pathname);

  // Asignamos la clase de posición según la ruta
  const positionClass = isBottomLeft ? "left-6" : "right-6";

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`fixed bottom-6 ${positionClass} z-50 p-3 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-green-500 dark:text-blue-400 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:scale-110 transition-all duration-300`}
      aria-label="Alternar tema"
    >
      {theme === "dark" ? <IconSun size={24} /> : <IconMoon size={24} />}
    </button>
  );
}