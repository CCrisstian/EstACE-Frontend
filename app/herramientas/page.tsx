"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconArrowLeft } from "@tabler/icons-react";

// --- CONFIGURACIÓN VISUAL DE CADA TARJETA ---
const dbConfig = {
  bgGlow: "bg-gradient-to-br from-transparent via-transparent to-blue-500/20",
  topLine: "bg-gradient-to-r from-transparent via-blue-500 to-transparent",
  bottomLine: "bg-gradient-to-r from-transparent via-blue-500 to-transparent",
  leftLine: "bg-gradient-to-b from-transparent via-blue-500 to-transparent",
  rightLine: "bg-gradient-to-b from-transparent via-blue-500 to-transparent",
  activeTitle: "text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]",
  hoverTitle: "group-hover:text-blue-400 group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]"
};

const backendConfig = {
  bgGlow: "bg-gradient-to-b from-transparent via-red-500/10 to-green-500/20",
  topLine: "bg-gradient-to-r from-transparent via-red-500 to-transparent",
  bottomLine: "bg-gradient-to-r from-transparent via-green-500 to-transparent",
  leftLine: "bg-[linear-gradient(to_bottom,transparent,theme(colors.red.500),theme(colors.green.500),transparent)]",
  rightLine: "bg-[linear-gradient(to_bottom,transparent,theme(colors.red.500),theme(colors.green.500),transparent)]",
  activeTitle: "text-green-400 drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]",
  hoverTitle: "group-hover:text-red-400 group-hover:drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]"
};

const frontendConfig = {
  bgGlow: "bg-gradient-to-br from-transparent via-transparent to-neutral-400/20",
  topLine: "bg-gradient-to-r from-transparent via-neutral-400 to-transparent",
  bottomLine: "bg-gradient-to-r from-transparent via-neutral-400 to-transparent",
  leftLine: "bg-gradient-to-b from-transparent via-neutral-400 to-transparent",
  rightLine: "bg-gradient-to-b from-transparent via-neutral-400 to-transparent",
  activeTitle: "text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]",
  hoverTitle: "group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
};

// --- COMPONENTE CARD ---
function Card({
  title,
  children,
  active,
  onClick,
  config
}: {
  title: string;
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  config: typeof dbConfig;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        w-full md:w-72 min-h-[350px] cursor-pointer rounded-[2.5rem] bg-neutral-900 border-2 border-neutral-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] group overflow-hidden relative flex flex-col items-center justify-start text-center p-8 transition-all hover:border-transparent
        ${active ? "border-transparent scale-105" : "hover:scale-105"}
      `}
    >
      <div className={`absolute inset-0 ${config.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${active ? "opacity-100" : ""}`} />

      <span className={`absolute inset-x-0 -top-px z-20 block h-[4px] w-full ${config.topLine} opacity-0 transition duration-500 group-hover:opacity-100 ${active ? "opacity-100" : ""}`} />
      <span className={`absolute inset-x-10 -top-px z-20 mx-auto block h-[4px] w-1/2 ${config.topLine} blur-sm opacity-0 transition duration-500 group-hover:opacity-100 ${active ? "opacity-100" : ""}`} />

      <span className={`absolute inset-x-0 -bottom-px z-20 block h-[4px] w-full ${config.bottomLine} opacity-0 transition duration-500 group-hover:opacity-100 ${active ? "opacity-100" : ""}`} />
      <span className={`absolute inset-x-10 -bottom-px z-20 mx-auto block h-[4px] w-1/2 ${config.bottomLine} blur-sm opacity-0 transition duration-500 group-hover:opacity-100 ${active ? "opacity-100" : ""}`} />

      <span className={`absolute inset-y-0 -left-px z-20 block w-[4px] h-full ${config.leftLine} opacity-0 transition duration-500 group-hover:opacity-100 ${active ? "opacity-100" : ""}`} />
      <span className={`absolute inset-y-0 -left-px z-20 my-auto block w-[4px] h-1/2 ${config.leftLine} blur-sm opacity-0 transition duration-500 group-hover:opacity-100 ${active ? "opacity-100" : ""}`} />

      <span className={`absolute inset-y-0 -right-px z-20 block w-[4px] h-full ${config.rightLine} opacity-0 transition duration-500 group-hover:opacity-100 ${active ? "opacity-100" : ""}`} />
      <span className={`absolute inset-y-0 -right-px z-20 my-auto block w-[4px] h-1/2 ${config.rightLine} blur-sm opacity-0 transition duration-500 group-hover:opacity-100 ${active ? "opacity-100" : ""}`} />

      <div className="relative z-10 flex flex-col items-center w-full h-full">
        <h2 className={`text-2xl font-bold transition-all duration-500 mb-6 ${active ? config.activeTitle : "text-neutral-500 " + config.hoverTitle}`}>
          {title}
        </h2>
        <div className="flex flex-col items-center justify-center w-full flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE SECTION ---
function Section({
  id,
  refProp,
  title,
  children,
  active,
}: {
  id: string;
  refProp: React.RefObject<HTMLDivElement | null>;
  title: string;
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <section
      id={id}
      ref={refProp}
      className={`
        min-h-screen px-6 md:px-12 flex flex-col justify-center
        transition-all duration-700 ease-in-out
        ${active ? "opacity-100 scale-100" : "opacity-20 scale-95"}
      `}
    >
      <div
        className={`
          max-w-5xl mx-auto w-full transition-all duration-700 rounded-3xl
          ${active ? "bg-white/5 dark:bg-white/5 backdrop-blur-md shadow-[0_0_60px_rgba(255,255,255,0.05)] p-8 md:p-16 border border-neutral-200/10 dark:border-white/10" : "p-8 md:p-16 border border-transparent"}
        `}
      >
        <h2
          className={`
            text-4xl md:text-5xl font-bold mb-8 transition-all duration-700
            ${active ? "text-neutral-900 dark:text-white" : "text-neutral-500"}
          `}
        >
          {title}
        </h2>

        <div className={`${active ? "opacity-100" : "opacity-40"} transition-all duration-700 text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed`}>
          {children}
        </div>
      </div>
    </section>
  );
}

// --- PÁGINA PRINCIPAL ---
export default function HerramientaPage() {
  const [active, setActive] = useState<string>("");
  const isClickScrolling = useRef(false);

  const headerRef = useRef<HTMLDivElement>(null); // Ref para el inicio de la página
  const dbRef = useRef<HTMLDivElement>(null);
  const backendRef = useRef<HTMLDivElement>(null);
  const frontendRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string, ref: React.RefObject<HTMLDivElement | null>) => {
    setActive(id); // Forzamos la selección visualmente al instante
    isClickScrolling.current = true; // Bloqueamos el observer temporalmente
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);
  };

  useEffect(() => {
    const sections = [
      { id: "", ref: headerRef },
      { id: "db", ref: dbRef },
      { id: "backend", ref: backendRef },
      { id: "frontend", ref: frontendRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isClickScrolling.current) {
            setActive(entry.target.id);
          }
        });
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "-30% 0px -30% 0px",
      }
    );

    sections.forEach((section) => {
      if (section.ref.current) {
        observer.observe(section.ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-black font-sans relative pb-32">

      <div className="fixed top-6 left-6 md:top-10 md:left-10 z-50">
        <Link 
          href="/"
          className="flex items-center gap-2 px-6 py-2 rounded-full border border-neutral-700 text-neutral-300 text-sm font-medium hover:bg-white hover:text-black transition-all bg-black/40 backdrop-blur-md"
        >
          <IconArrowLeft size={20} />
          <span>Volver al Inicio</span>
        </Link>
      </div>

      <div id="" ref={headerRef} className="pt-20 md:pt-24 pb-16 flex flex-col items-center justify-center w-full px-6">
        <div className="w-full max-w-5xl flex flex-col items-center">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              Herramientas y Arquitectura
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 font-light">
              Explora el stack tecnológico detrás de A.C.E. V.2.0
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 w-full">
            
            {/* TARJETA 1: Base de Datos */}
            <Card 
              title="Base de Datos" 
              active={active === "db"} 
              onClick={() => scrollTo("db", dbRef)} 
              config={dbConfig}
            >
              <div className="relative w-46 h-46 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Image src="/postgresql_logo_icon.png" alt="PostgreSQL" fill className="object-contain" />
              </div>
            </Card>

            {/* TARJETA 2: Backend (Dual Color) */}
            <Card 
              title="Backend" 
              active={active === "backend"} 
              onClick={() => scrollTo("backend", backendRef)} 
              config={backendConfig}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-36 h-36 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                  <Image src="/java_logo_icon.png" alt="Java" fill className="object-contain" />
                </div>
                <div className="relative w-42 h-22 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                  <Image src="/spring_boot_logo_icon.png" alt="Spring Boot" fill className="object-contain" />
                </div>
              </div>
            </Card>

            {/* TARJETA 3: Frontend */}
            <Card 
              title="Frontend" 
              active={active === "frontend"} 
              onClick={() => scrollTo("frontend", frontendRef)} 
              config={frontendConfig}
            >
              <div className="relative w-46 h-46 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <Image src="/nextjs_logo_icon.png" alt="Next.js" fill className="object-contain" />
              </div>
            </Card>

          </div>
        </div>
      </div>

      <div className="w-full">
        <Section id="db" active={active === "db"} refProp={dbRef} title="Base de Datos">
          <p>La capa de persistencia se encarga de almacenar de forma segura y relacional la información crítica del negocio. Utilizamos PostgreSQL para garantizar integridad referencial y Supabase como proveedor en la nube.</p>
        </Section>

        <Section id="backend" active={active === "backend"} refProp={backendRef} title="Backend">
          <p>El núcleo del sistema está construido en Java utilizando Spring Boot. Provee una API RESTful asegurada mediante JWT (JSON Web Tokens) y gestiona toda la lógica de negocio, cálculo de tarifas y control de accesos.</p>
        </Section>

        <Section id="frontend" active={active === "frontend"} refProp={frontendRef} title="Frontend">
          <p>La interfaz de usuario está desarrollada con React y Next.js, ofreciendo una experiencia moderna, rápida y Server-Side Rendered (SSR) para maximizar el rendimiento. Los estilos se manejan con Tailwind CSS.</p>
        </Section>
      </div>

    </div>
  );
}