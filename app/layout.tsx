import "@/app/globals.css";
import Footer from "@/components/Footer"; 
import { ThemeProvider } from "@/components/ThemeProvider"; 
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = {
  title: "A.C.E. V2.0",
  description: "Portafolio Backend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* Agregamos las clases de flex, colores base globales y la transición */}
      <body className="flex flex-col min-h-screen bg-[#F9F5F0] dark:bg-black transition-colors duration-500">

        {/* Agregamos enableSystem={false} para que obedezca siempre al botón */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        
          {/* El contenido de las páginas (page.tsx) */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Footer globalmente */}
          <Footer />
          
          <ThemeToggle /> {/* El botón vivirá aquí globalmente */}
        </ThemeProvider>
      </body>
    </html>
  );
}