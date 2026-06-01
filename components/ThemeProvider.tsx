"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Usamos React.ComponentProps para que TypeScript deduzca las propiedades 
// automáticamente sin tener que importar archivos desde /dist/types
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}