import { IconBrandGithub, IconBrandLinkedin, IconMail } from "@tabler/icons-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-neutral-800 bg-black py-8 px-6 mt-auto relative z-50">
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
          {/* GitHub */}
          <a 
            href="https://github.com/CCrisstian" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-white hover:scale-110 transition-all"
            aria-label="GitHub"
          >
            <IconBrandGithub size={30} stroke={1.5} />
          </a>
          
          {/* LinkedIn (Recuerda cambiar el enlace por el tuyo real) */}
          <a 
            href="https://www.linkedin.com/in/cristian-alejandro-cristaldo/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-blue-500 hover:scale-110 transition-all"
            aria-label="LinkedIn"
          >
            <IconBrandLinkedin size={30} stroke={1.5} />
          </a>

          {/* Email */}
          <a 
            href="mailto:crisstiann.c@gmail.com" 
            className="text-neutral-400 hover:text-red-400 hover:scale-110 transition-all"
            aria-label="Email"
          >
            <IconMail size={30} stroke={1.5} />
          </a>
        </div>

      </div>
    </footer>
  );
}