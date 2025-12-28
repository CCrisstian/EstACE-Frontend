"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import Image from "next/image";
import { Timeline } from "@/components/ui/timeline";

export default function Home() {
  
  const timelineData = [
    {
      title: "Origen",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-base md:text-lg font-normal mb-8">
            El proyecto Sistema de Gestión de Estacionamientos A.C.E. nació originalmente como una solución para la materia 
            <span className="font-bold text-blue-500"> Seminario Integrador en la UTN FRRe</span>.
          </p>
          <p className="text-neutral-800 dark:text-neutral-200 text-sm md:text-base font-normal mb-8">
             Su objetivo primordial es simplificar la administración diaria de un flujo vehicular, permitiendo el control de ingresos, egresos, disponibilidad de espacios y facturación de manera automatizada.
          </p>
        </div>
      ),
    },
    {
      title: "Motivación",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-base md:text-lg font-normal mb-4">
            La transición hacia la Versión 2.0 surge del deseo de evolucionar una herramienta funcional hacia un estándar profesional moderno:
          </p>
          <ul className="list-disc pl-5 text-neutral-700 dark:text-neutral-300 space-y-2 mb-8">
            <li><strong>Especialización en Java:</strong> Profundizar en el ecosistema Spring Boot para APIs robustas.</li>
            <li><strong>Arquitectura Desacoplada:</strong> Migrar de un monolito a Frontend y Backend separados.</li>
            <li><strong>Cloud Computing:</strong> Infraestructura 100% en la nube (Supabase, Vercel, Render).</li>
            <li><strong>Clean Code:</strong> Un producto que refleje buenas prácticas para el mundo profesional.</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Evolución Tecnológica",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Tarjeta Antes */}
           <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Proyecto Original</h4>
              <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-300">
                <li>❌ Monolítica (WebForms)</li>
                <li>❌ .NET (C#)</li>
                <li>❌ MSSQL (Local)</li>
                <li>❌ Despliegue Local / IIS</li>
              </ul>
           </div>
           
           {/* Tarjeta Ahora */}
           <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">EstACE V2.0 (Actual)</h4>
              <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-300">
                <li>✅ Decoupled (REST API + Front)</li>
                <li>✅ Java + Spring Boot</li>
                <li>✅ PostgreSQL (Supabase Cloud)</li>
                <li>✅ Vercel + Render (Cloud)</li>
              </ul>
           </div>
        </div>
      ),
    },
    {
      title: "Funcionalidades",
      content: (
        <div>
           <p className="text-neutral-800 dark:text-neutral-200 text-base font-normal mb-4">
            El sistema resuelve los puntos críticos de la gestión operativa:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
               <span className="text-2xl">🚗</span>
               <span className="text-neutral-700 dark:text-neutral-300">Control de Flujo y Patentes</span>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-2xl">💲</span>
               <span className="text-neutral-700 dark:text-neutral-300">Cálculo Automatizado de Tarifas</span>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-2xl">📊</span>
               <span className="text-neutral-700 dark:text-neutral-300">Monitoreo de Capacidad Real</span>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-2xl">👥</span>
               <span className="text-neutral-700 dark:text-neutral-300">Roles (Dueño / Playero)</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Agradecimientos",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-base font-normal mb-4">
            Un reconocimiento especial a mis compañeros de equipo del proyecto original <span className="font-bold">"ACE Parking" (v1.0)</span>, realizado para la materia Seminario Integrador.
          </p>
          
          <div className="mb-6">
            <h4 className="text-lg font-bold text-black dark:text-white mb-2">Integrantes del Equipo Original:</h4>
            <ul className="list-disc pl-5 text-neutral-700 dark:text-neutral-300 space-y-1">
              <li>Eric Deppeler</li>
              <li>Ana María Duré</li>
              <li>Cristian Cristaldo <span className="text-xs text-neutral-500">(Desarrollador v2.0)</span></li>
            </ul>
          </div>

          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-lg">
             <Image
                src="/equipo-v1.jpeg"
                alt="Equipo ACE Parking v1.0"
                fill
                className="object-cover object-top"
             />
          </div>
        </div>
      ),
    },
  ];

  return (
    // CAMBIO IMPORTANTE: Usamos min-h-screen en lugar de h-screen para permitir el scroll
    <div className="relative mx-auto w-full min-h-screen bg-white dark:bg-black overflow-x-hidden"> 
      <Navbar />
      
      {/* SECCIÓN HERO (Presentación inicial) */}
      <div className="relative flex flex-col items-center justify-center min-h-[90vh] w-full">
        {/* Líneas de fondo decorativas */}
        <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
          <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
        </div>
        <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
          <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
          <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </div>

        <div className="px-4 relative z-10 text-center mt-20">
          {/* Titulo Animado */}
          <h1 className="mx-auto max-w-4xl text-center text-5xl font-bold text-slate-900 md:text-7xl lg:text-9xl dark:text-slate-100 tracking-tight">
            {"A.C.E. V2.0"
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeInOut",
                  }}
                  className="mr-4 inline-block"
                >
                  {word}
                </motion.span>
              ))}
          </h1>

          {/* Descripción */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="mx-auto max-w-xl py-6 text-center text-xl md:text-2xl font-light text-neutral-600 dark:text-neutral-400"
          >
            Esta página refleja el proceso de aprendizaje y especialización en el desarrollo Backend con Java, buscando transformar una base académica en una solución tecnológica escalable.
          </motion.p>
        </div>
      </div>

      
      <div className="w-full bg-white dark:bg-black pb-20">
         <Timeline data={timelineData} />
      </div>

    </div>
  );
}

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full flex items-center justify-between border-b border-neutral-200 px-8 py-4 dark:border-neutral-800 bg-white/50 dark:bg-black/50 backdrop-blur-md z-50">
      <div className="flex items-center gap-3">
      <div className="size-12 relative overflow-hidden rounded-full">
          <Image
            src="/LogoACE_SinFondo.png"          
            alt="Logo EstACE"
            fill                     
            className="object-cover" 
            sizes="80px"             
          />
        </div>
        <h1 className="text-xl font-bold text-black dark:text-white">ACE V2.0</h1>
      </div>
      <Link href="/login">
        <HoverBorderGradient
          containerClassName="rounded-lg" 
          as="button"
          className="bg-black text-white flex items-center space-x-2"
        >
          <span>Login</span>
        </HoverBorderGradient>
      </Link>
    </nav>
  );
};