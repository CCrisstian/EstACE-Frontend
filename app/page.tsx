"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconHistory, 
  IconCode, 
  IconUserScan,
  IconListCheck
} from "@tabler/icons-react";

const carouselCards = [
  {
    id: 1,
    title: "Funcionalidades",
    description: "Descubre en detalle las capacidades del sistema: gestión del estacionamiento, cálculo de tarifas y reportes.",
    icon: <IconListCheck className="w-24 h-24 text-blue-500 mb-6 transition-colors" />,
    href: "/funcionalidades", 
    glowColor: "via-blue-500",
    bgGlow: "to-blue-500/15",
    hoverText: "group-hover:text-blue-500",
    buttonHover: "group-hover:bg-blue-500 group-hover:text-white dark:group-hover:bg-blue-400 dark:group-hover:text-black"
  },
  {
    id: 2,
    title: "Herramientas y Arquitectura",
    description: "Explora el stack tecnológico utilizado: Base de Datos, Backend y Frontend.",
    icon: <IconCode className="w-24 h-24 text-green-500 mb-6 transition-colors" />,
    href: "/herramientas", 
    glowColor: "via-green-500",
    bgGlow: "to-green-500/15",
    hoverText: "group-hover:text-green-500",
    buttonHover: "group-hover:bg-green-500 group-hover:text-white dark:group-hover:bg-green-400 dark:group-hover:text-black"
  },
  {
    id: 3,
    title: "Login como Invitado",
    description: "Explora la aplicación en un entorno seguro de solo lectura. Ideal para ver el sistema en acción sin necesidad de registrarse.",
    icon: <IconUserScan className="w-24 h-24 text-purple-500 mb-6 transition-colors" />,
    href: "#", 
    glowColor: "via-purple-500",
    bgGlow: "to-purple-500/15",
    hoverText: "group-hover:text-purple-500",
    buttonHover: "group-hover:bg-purple-500 group-hover:text-white dark:group-hover:bg-purple-400 dark:group-hover:text-black"
  },
  {
    id: 4,
    title: "Historia del Proyecto",
    description: "Conoce el origen de A.C.E., desde su nacimiento académico en la UTN hasta su evolución tecnológica actual.",
    icon: <IconHistory className="w-24 h-24 text-orange-500 mb-6 transition-colors" />,
    href: "/historia", 
    glowColor: "via-orange-500",
    bgGlow: "to-orange-500/15",
    hoverText: "group-hover:text-orange-500",
    buttonHover: "group-hover:bg-orange-500 group-hover:text-white dark:group-hover:bg-orange-400 dark:group-hover:text-black"
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextCard = () => setCurrentIndex((prev) => (prev === carouselCards.length - 1 ? 0 : prev + 1));
  const prevCard = () => setCurrentIndex((prev) => (prev === 0 ? carouselCards.length - 1 : prev - 1));

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50; 
    if (info.offset.x < -swipeThreshold) nextCard();
    else if (info.offset.x > swipeThreshold) prevCard();
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F9F5F0] dark:bg-black overflow-hidden flex flex-col lg:flex-row transition-colors duration-500">
      
      {/* --- SECCIÓN IZQUIERDA --- */}
      <div className="w-full lg:w-1/2 min-h-[60vh] lg:min-h-screen flex flex-col justify-center relative order-1 p-6 lg:p-10 xl:p-16 transition-colors duration-500">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10 max-w-xl mx-auto lg:mx-0 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-72 h-48 sm:w-[360px] sm:h-[240px] mb-0 lg:mb-2" 
          >
            {/* Imagen para Modo Oscuro */}
            <Image 
              src="/LogoACE_SinFondo.png" 
              alt="Logo EstACE" 
              fill 
              sizes="(max-width: 640px) 288px, 360px"
              className="object-contain hidden dark:block" 
              priority 
              unoptimized /* Mantiene los colores originales puros del PNG */
            />
            
            {/* Imagen para Modo Claro */}
            <Image 
              src="/LogoACE_SinFondo_Claro.png" 
              alt="Logo EstACE" 
              fill 
              sizes="(max-width: 640px) 288px, 360px"
              className="object-contain block dark:hidden" 
              priority 
              unoptimized
            />
          </motion.div>

          <h1 className="text-5xl font-bold text-black md:text-6xl xl:text-7xl dark:text-slate-100 tracking-tight mb-4 mt-[-10px]">
            {"A.C.E. V2.0".split(" ").map((word, index) => (
              <motion.span key={index} initial={{ opacity: 0, filter: "blur(4px)", x: -10 }} animate={{ opacity: 1, filter: "blur(0px)", x: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} className="mr-3 inline-block">
                {word}
              </motion.span>
            ))}
          </h1>

          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed max-w-md lg:max-w-full">
            Esta página refleja el proceso de aprendizaje en el desarrollo Backend con Java, buscando transformar una base académica en una solución tecnológica escalable.
          </p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <Link href="/login">
              <HoverBorderGradient containerClassName="rounded-lg p-[2px]" as="button" className="bg-[#F9F5F0] text-black dark:bg-black dark:text-white flex items-center space-x-2 border-2 border-neutral-300 dark:border-neutral-800 transition-colors">
                <span className="font-semibold px-4 py-1">Login</span>
              </HoverBorderGradient>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* --- SECCIÓN DERECHA --- */}
      <div className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen flex flex-col items-center justify-center relative order-2 p-6 z-10 transition-colors duration-500">
        <div style={{ perspective: "1200px" }} className="relative w-full max-w-sm h-[460px] flex items-center justify-center">
        <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, rotateY: 20, scale: 0.9 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1, y: [0, -12, 0] }}
              exit={{ opacity: 0, rotateY: -20, scale: 0.9 }}
              transition={{ duration: 0.5, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
              className="absolute w-full h-full cursor-grab active:cursor-grabbing"
              drag="x" 
              dragConstraints={{ left: 0, right: 0 }} 
              dragElastic={0.2} 
              onDragEnd={handleDragEnd} 
            >
              <Link href={carouselCards[currentIndex].href} className="block w-full h-full">
                <div className="w-full h-full rounded-[2.5rem] bg-[#F9F5F0] dark:bg-neutral-900 border-2 border-neutral-400 dark:border-neutral-800 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] group overflow-hidden relative flex flex-col items-center justify-center text-center p-10 transition-all hover:border-transparent">
                  
                  <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent ${carouselCards[currentIndex].bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                  
                  <span className={`absolute inset-x-0 -bottom-px z-20 block h-[6px] w-full bg-gradient-to-r from-transparent ${carouselCards[currentIndex].glowColor} to-transparent opacity-0 transition duration-500 group-hover:opacity-100`} />
                  <span className={`absolute inset-x-10 -bottom-px z-20 mx-auto block h-[6px] w-1/2 bg-gradient-to-r from-transparent ${carouselCards[currentIndex].glowColor} to-transparent opacity-0 blur-sm transition duration-500 group-hover:opacity-100`} />
                  
                  <span className={`absolute inset-x-0 -top-px z-20 block h-[6px] w-full bg-gradient-to-r from-transparent ${carouselCards[currentIndex].glowColor} to-transparent opacity-0 transition duration-500 group-hover:opacity-100`} />
                  <span className={`absolute inset-x-10 -top-px z-20 mx-auto block h-[6px] w-1/2 bg-gradient-to-r from-transparent ${carouselCards[currentIndex].glowColor} to-transparent opacity-0 blur-sm transition duration-500 group-hover:opacity-100`} />
                  
                  <span className={`absolute inset-y-0 -left-px z-20 block w-[6px] h-full bg-gradient-to-b from-transparent ${carouselCards[currentIndex].glowColor} to-transparent opacity-0 transition duration-500 group-hover:opacity-100`} />
                  <span className={`absolute inset-y-0 -left-px z-20 my-auto block w-[6px] h-1/2 bg-gradient-to-b from-transparent ${carouselCards[currentIndex].glowColor} to-transparent opacity-0 blur-sm transition duration-500 group-hover:opacity-100`} />
                  
                  <span className={`absolute inset-y-0 -right-px z-20 block w-[6px] h-full bg-gradient-to-b from-transparent ${carouselCards[currentIndex].glowColor} to-transparent opacity-0 transition duration-500 group-hover:opacity-100`} />
                  <span className={`absolute inset-y-0 -right-px z-20 my-auto block w-[6px] h-1/2 bg-gradient-to-b from-transparent ${carouselCards[currentIndex].glowColor} to-transparent opacity-0 blur-sm transition duration-500 group-hover:opacity-100`} />

                  <div className="relative z-10 flex flex-col items-center">
                    {carouselCards[currentIndex].icon}
                    <h3 className={`text-2xl font-bold text-slate-800 dark:text-white mb-4 transition-colors ${carouselCards[currentIndex].hoverText}`}>
                      {carouselCards[currentIndex].title}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-base leading-relaxed">
                      {carouselCards[currentIndex].description}
                    </p>
                    <div className={`mt-8 px-8 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-md font-medium transition-all ${carouselCards[currentIndex].buttonHover}`}>
                      Saber más
                    </div>
                  </div>

                </div>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-8 mt-12">
          <button onClick={prevCard} className="p-4 rounded-full bg-[#F9F5F0] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-slate-800 hover:bg-neutral-100 dark:hover:text-white dark:hover:bg-neutral-800 transition-all active:scale-90 shadow-xl">
            <IconChevronLeft size={28} />
          </button>
          <div className="flex gap-3">
            {carouselCards.map((_, index) => (
              <div key={index} className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex ? "w-10 bg-black dark:bg-white" : "w-3 bg-neutral-300 dark:bg-neutral-700"}`} />
            ))}
          </div>
          <button onClick={nextCard} className="p-4 rounded-full bg-[#F9F5F0] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-slate-800 hover:bg-neutral-100 dark:hover:text-white dark:hover:bg-neutral-800 transition-all active:scale-90 shadow-xl">
            <IconChevronRight size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}