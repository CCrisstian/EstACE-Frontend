"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Estado para controlar qué tan arriba debe estar el botón (24px es el bottom-6 por defecto)
  const [bottomOffset, setBottomOffset] = useState(24);

  // Evita errores de hidratación y maneja el scroll
  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      // Buscamos el footer en el documento
      const footer = document.querySelector('footer');
      if (!footer) return;

      // Obtenemos la posición del footer y la altura de la ventana
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Si el footer está visible en la pantalla
      if (footerRect.top < windowHeight) {
        // Empujamos el botón hacia arriba: (Altura visible del footer + 24px de margen)
        const visibleFooterHeight = windowHeight - footerRect.top;
        setBottomOffset(visibleFooterHeight + 24);
      } else {
        // Si no se ve el footer, mantenemos el margen original
        setBottomOffset(24);
      }
    };

    // Escuchar el scroll y el cambio de tamaño de ventana
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    // Ejecutar una vez al inicio por si la página es corta y el footer ya está visible
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  if (!mounted) return null;

  // Definimos la posición horizontal del botón
  const positionClass = "right-6";

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      // Controlamos la altura de forma dinámica usando nuestro estado 'bottomOffset'
      style={{ bottom: `${bottomOffset}px` }}
      className={`fixed ${positionClass} z-50 p-3 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-green-500 dark:text-blue-400 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:scale-110 transition duration-300`}
      aria-label="Alternar tema"
    >
      {theme === "dark" ? <IconSun size={24} /> : <IconMoon size={24} />}
    </button>
  );
}