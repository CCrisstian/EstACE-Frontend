import "@/app/globals.css";

import Footer from "@/components/Footer"; 

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
    <html lang="es">
      {/* Agregamos flex y flex-col al body para asegurar que el footer siempre quede abajo */}
      <body className="min-h-screen flex flex-col bg-black">
        
        {/* El contenido de las páginas (page.tsx) */}
        <main className="flex-grow">
          {children}
        </main>

        {/* 2. Footer globalmente */}
        <Footer />
        
      </body>
    </html>
  );
}