"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { IconBrandGithub, IconBrandLinkedin, IconMail } from "@tabler/icons-react";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  
  // Estado para controlar si el correo está visible o no
  const [showEmail, setShowEmail] = useState(false);

  // 1. Definimos exactamente en qué páginas queremos que aparezca el Footer
  const allowedRoutes = ["/", "/funcionalidades", "/herramientas", "/historia"];

  // 2. Si la ruta actual NO está en esa lista, devolvemos 'null' (el componente se oculta)
  if (!allowedRoutes.includes(pathname)) {
    return null;
  }

  // 3. Si la ruta SÍ está permitida, renderizamos el Footer normalmente
  return (
    <footer className="w-full border-t border-neutral-800 bg-black py-2 px-6 mt-auto relative z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Info del Autor */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="text-neutral-400 text-sm font-light">
            Desarrollado por <span className="text-white font-medium">Cristaldo Cristian Alejandro</span>
          </p>
          <p className="text-neutral-600 text-xs">
            © {currentYear} A.C.E. V2.0 - Todos los derechos reservados.
          </p>
        </div>

        {/* Enlaces y Redes */}
        <div className="flex items-center gap-5">
          <a 
            href="https://github.com/CCrisstian" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-white hover:scale-110 transition-all"
            aria-label="GitHub"
          >
            <IconBrandGithub size={30} stroke={1.5} />
          </a>
          
          <a 
            href="https://www.linkedin.com/in/cristian-alejandro-cristaldo/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-blue-500 hover:scale-110 transition-all"
            aria-label="LinkedIn"
          >
            <IconBrandLinkedin size={30} stroke={1.5} />
          </a>

          {/* Contenedor del Botón de Correo Interactivo */}
          <div className="flex items-center">
            <button 
              onClick={() => setShowEmail(!showEmail)}
              className={`text-neutral-400 hover:text-red-500 hover:scale-110 transition-all cursor-pointer ${showEmail ? 'text-red-500' : ''}`}
              title="Mostrar correo"
            >
              <IconMail size={30} stroke={1.5} />
            </button>
            
            {/* Texto del correo oculto por defecto, se revela al hacer clic */}
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden flex items-center ${showEmail ? 'max-w-[250px] opacity-100 ml-3' : 'max-w-0 opacity-0'}`}
            >
              <a 
                href="mailto:crisstiann.c@gmail.com" 
                className="text-neutral-300 hover:text-white text-sm font-medium whitespace-nowrap"
                title="Haga clic para enviar un correo"
              >
                crisstiann.c@gmail.com
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}