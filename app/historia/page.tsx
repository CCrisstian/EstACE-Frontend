"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconArrowLeft } from "@tabler/icons-react";

export default function HistoriaPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveIndex(Number((entry.target as HTMLElement).dataset.index));
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "-45% 0px -45% 0px", 
      threshold: 0,
    });

    const elements = document.querySelectorAll(".timeline-section");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const timelineData = [
    {
      title: "Origen",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-base md:text-lg font-normal mb-4">
            El proyecto Sistema de Gestión de Estacionamientos A.C.E. nació originalmente como una solución para la materia 
            <span className="font-bold text-blue-500"> Seminario Integrador en la UTN FRRe</span>.
          </p>
          <p className="text-neutral-800 dark:text-neutral-200 text-base md:text-lg font-normal mb-4">
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
          <ul className="list-disc pl-5 text-neutral-700 dark:text-neutral-300 text-base md:text-lg font-normal space-y-2 mb-4">
            <li><strong>Especialización en Java:</strong> Profundizar en el ecosistema Spring Boot para APIs robustas.</li>
            <li><strong>Arquitectura Desacoplada:</strong> Migrar de un monolito a Frontend y Backend separados.</li>
            <li><strong>Cloud Computing:</strong> Infraestructura 100% en la nube (Supabase, Vercel, Render).</li>
            <li><strong>Clean Code:</strong> Un producto que refleje buenas prácticas para el mundo profesional.</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Evolución",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="p-4 md:p-5 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
              <h3 className="text-base md:text-lg font-bold text-red-600 dark:text-red-400 mb-2">Proyecto Original</h3>
              <ul className="text-sm md:text-base font-normal space-y-1 text-neutral-600 dark:text-neutral-400">
                <li>❌ Monolítica (WebForms)</li>
                <li>❌ .NET (C#)</li>
                <li>❌ MSSQL (Local)</li>
                <li>❌ Despliegue Local / IIS</li>
              </ul>
           </div>
           
           <div className="p-4 md:p-5 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30">
              <h3 className="text-base md:text-lg font-bold text-green-600 dark:text-green-400 mb-2">EstACE V2.0 (Actual)</h3>
              <ul className="text-sm md:text-base font-normal space-y-1 text-neutral-600 dark:text-neutral-400">
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
           <p className="text-neutral-800 dark:text-neutral-200 text-base md:text-lg font-normal mb-4">
            El sistema resuelve los puntos críticos de la gestión operativa:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-900/50 p-3 rounded-xl">
               <span className="text-2xl">🚗</span>
               <span className="text-neutral-700 dark:text-neutral-300 font-medium text-sm md:text-base">Control de Flujo</span>
            </div>
            <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-900/50 p-3 rounded-xl">
               <span className="text-2xl">💲</span>
               <span className="text-neutral-700 dark:text-neutral-300 font-medium text-sm md:text-base">Cálculo de Tarifas</span>
            </div>
            <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-900/50 p-3 rounded-xl">
               <span className="text-2xl">📊</span>
               <span className="text-neutral-700 dark:text-neutral-300 font-medium text-sm md:text-base">Monitoreo de Plazas</span>
            </div>
            <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-900/50 p-3 rounded-xl">
               <span className="text-2xl">👥</span>
               <span className="text-neutral-700 dark:text-neutral-300 font-medium text-sm md:text-base">Gestión de Roles</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Agradecimientos",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-base md:text-lg font-normal mb-4">
            Un reconocimiento especial a mis compañeros de equipo del proyecto original <span className="font-bold text-blue-500">"ACE Parking" (v1.0)</span>, realizado para la materia Seminario Integrador.
          </p>
          
          <div className="mb-6 bg-neutral-100 dark:bg-neutral-900/50 p-4 rounded-xl">
            <h4 className="text-base md:text-lg font-bold text-black dark:text-white mb-2">Integrantes del Equipo Original:</h4>
            <ul className="list-disc pl-5 text-neutral-700 dark:text-neutral-300 text-sm md:text-base font-normal space-y-1">
              <li>Eric Deppeler</li>
              <li>Ana María Duré</li>
              <li>Cristian Cristaldo <span className="text-xs text-neutral-500 bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded ml-2">Desarrollador v2.0</span></li>
            </ul>
          </div>

          <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl">
             <Image
                src="/equipo-v1.jpeg"
                alt="Equipo ACE Parking v1.0"
                fill
                className="object-cover object-top hover:scale-105 transition-transform duration-700"
             />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-black font-sans relative">
      
      {/* BOTÓN VOLVER */}
      <div className="fixed top-6 left-6 md:top-10 md:left-10 z-50">
        <Link 
          href="/"
          className="flex items-center gap-2 px-6 py-2 rounded-full border border-neutral-700 text-neutral-300 text-sm font-medium hover:bg-white hover:text-black transition-all bg-black/40 backdrop-blur-md"
        >
          <IconArrowLeft size={20} />
          <span>Volver al Inicio</span>
        </Link>
      </div>

      <div className="pt-24 lg:pt-32">
        {/* Cabecera reducida y margen inferior a 0 */}
        <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 mb-0">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
            Historia del Proyecto
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 font-light max-w-2xl">
            El recorrido, los desafíos y la evolución que transformaron una idea académica en una solución tecnológica en la nube.
          </p>
        </div>

        <div className="w-full font-sans">
          <div className="max-w-5xl mx-auto pb-32 px-6 md:px-10 lg:px-12">
            {timelineData.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <div 
                  key={index} 
                  data-index={index} 
                  // MÁRGENES DRASTICAMENTE REDUCIDOS: pt-4 para el primero, pt-8/pt-12 para el resto
                  className={`timeline-section flex flex-col md:flex-row w-full relative ${
                    index === 0 ? "pt-4 md:pt-6" : "pt-8 md:pt-12"
                  }`}
                >
                  
                  {/* --- IZQUIERDA: CONTENIDO Y DESCRIPCIONES --- */}
                  <div className="w-full md:w-[55%] pr-0 md:pr-10 z-10">
                    <h3 className="md:hidden block text-3xl mb-4 font-bold text-neutral-800 dark:text-neutral-200">
                      {item.title}
                    </h3>
                    {item.content}
                  </div>

                  {/* --- DERECHA: TÍTULOS --- */}
                  <div className="hidden md:flex w-[45%] relative self-start items-center z-10">
                    
                    <div className="h-10 w-10 absolute -left-[20px] rounded-full bg-neutral-50 dark:bg-black flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shadow-sm">
                      <div 
                        className={`h-4 w-4 rounded-full transition-all duration-500 ease-in-out
                          ${isActive 
                            ? "bg-black dark:bg-white shadow-[0_0_15px_rgba(0,0,0,0.6)] dark:shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-110" 
                            : "bg-neutral-300 dark:bg-neutral-700 scale-100"
                          }
                        `} 
                      />
                    </div>
                    
                    <h3 
                      className={`text-2xl lg:text-4xl xl:text-5xl font-bold pl-8 transition-all duration-500 ease-in-out
                        ${isActive 
                          ? "text-black dark:text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" 
                          : "text-neutral-400 dark:text-neutral-600"
                        }
                      `}
                    >
                      {item.title}
                    </h3>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}