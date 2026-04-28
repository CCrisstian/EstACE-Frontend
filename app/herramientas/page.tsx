"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconArrowLeft, 
  IconDatabase, 
  IconCloud, 
  IconLock, 
  IconSitemap, 
  IconFileTypePdf,
  IconX,
  IconDownload,
  IconZoomIn,
  IconZoomOut,
  IconCoffee, 
  IconLeaf, 
  IconBrandDocker, 
  IconHierarchy,
  IconBrandGithub,
  IconBrandNextjs,
  IconBrandReact,
  IconBrandTailwind,
  IconBrandVercel,
  IconMap,
  IconPalette,
  IconExternalLink
} from "@tabler/icons-react";

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
  activeTitle: "text-red-400 drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]",
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
function Card({ title, children, active, onClick, config }: any) {
  return (
    <div onClick={onClick} className={`w-full md:w-72 min-h-[350px] cursor-pointer rounded-[2.5rem] bg-neutral-900 border-2 border-neutral-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] group overflow-hidden relative flex flex-col items-center justify-start text-center p-8 transition-all hover:border-transparent ${active ? "border-transparent scale-105" : "hover:scale-105"}`}>
      <div className={`absolute inset-0 ${config.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${active ? "opacity-100" : ""}`} />
      <span className={`absolute inset-x-0 -top-px z-20 block h-[4px] w-full ${config.topLine} opacity-0 transition duration-500 group-hover:opacity-100 ${active ? "opacity-100" : ""}`} />
      <span className={`absolute inset-x-0 -bottom-px z-20 block h-[4px] w-full ${config.bottomLine} opacity-0 transition duration-500 group-hover:opacity-100 ${active ? "opacity-100" : ""}`} />
      <span className={`absolute inset-y-0 -left-px z-20 block w-[4px] h-full ${config.leftLine} opacity-0 transition duration-500 group-hover:opacity-100 ${active ? "opacity-100" : ""}`} />
      <span className={`absolute inset-y-0 -right-px z-20 block w-[4px] h-full ${config.rightLine} opacity-0 transition duration-500 group-hover:opacity-100 ${active ? "opacity-100" : ""}`} />
      <div className="relative z-10 flex flex-col items-center w-full h-full">
        <h2 className={`text-2xl font-bold transition-all duration-500 mb-6 ${active ? config.activeTitle : "text-neutral-500 " + config.hoverTitle}`}>{title}</h2>
        <div className="flex flex-col items-center justify-center w-full flex-1">{children}</div>
      </div>
    </div>
  );
}

// COMPONENTE SECTION
function Section({ id, refProp, title, children }: any) {
  return (
    <section id={id} ref={refProp} className="w-full px-6 md:px-12 flex flex-col justify-start pt-5 pb-4">
      <div className="max-w-5xl mx-auto w-full rounded-3xl bg-white/5 backdrop-blur-md shadow-[0_0_60px_rgba(255,255,255,0.05)] p-8 md:p-16 border border-neutral-200/10 dark:border-white/10">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-neutral-900 dark:text-white">{title}</h2>
        <div className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">{children}</div>
      </div>
    </section>
  );
}
// --- PÁGINA PRINCIPAL ---
export default function HerramientaPage() {
  const [active, setActive] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isClickScrolling = useRef(false);

  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const dbRef = useRef<HTMLDivElement>(null);
  const backendRef = useRef<HTMLDivElement>(null);
  const frontendRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string, ref: any) => {
    setActive(id);
    isClickScrolling.current = true;
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => { isClickScrolling.current = false; }, 1000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isClickScrolling.current) {
          setActive(entry.target.id);
        }
      });
    }, { root: null, threshold: 0, rootMargin: "-30% 0px -30% 0px" });

    [headerRef, dbRef, backendRef, frontendRef].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-black font-sans relative pb-32">
      
      {/* MODAL DE BASE DE DATOS */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 overflow-hidden"
            onClick={() => { setIsModalOpen(false); setTimeout(() => setZoom(1), 300); }}
          >
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-neutral-900/80 border border-neutral-700 p-2 rounded-full z-50 shadow-2xl backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setZoom((prev) => Math.max(1, prev - 0.5))} className="p-3 hover:bg-neutral-800 rounded-full text-neutral-300 transition-colors"><IconZoomOut size={24} /></button>
              <span className="text-white font-medium text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((prev) => Math.min(4, prev + 0.5))} className="p-3 hover:bg-neutral-800 rounded-full text-neutral-300 transition-colors"><IconZoomIn size={24} /></button>
            </div>
            <button className="absolute top-6 right-6 text-white/70 hover:text-white z-50 bg-black/50 p-2 rounded-full" onClick={() => { setIsModalOpen(false); setTimeout(() => setZoom(1), 300); }}><IconX size={32} /></button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: zoom, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              drag={zoom > 1} dragConstraints={{ left: -800 * (zoom - 1), right: 800 * (zoom - 1), top: -400 * (zoom - 1), bottom: 400 * (zoom - 1) }}
              className={`relative w-full max-w-6xl aspect-video flex items-center justify-center ${zoom > 1 ? "cursor-grab" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src="/der_estace.png" alt="DER EstACE Ampliado" fill className="object-contain pointer-events-none" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE ARQUITECTURA */}
      <AnimatePresence>
        {isArchitectureModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 overflow-hidden"
            onClick={() => { setIsArchitectureModalOpen(false); setTimeout(() => setZoom(1), 300); }}
          >
            {/* Controles de Zoom */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-neutral-900/80 border border-neutral-700 p-2 rounded-full z-50 shadow-2xl backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setZoom((prev) => Math.max(1, prev - 0.5))} className="p-3 hover:bg-neutral-800 rounded-full text-neutral-300 transition-colors"><IconZoomOut size={24} /></button>
              <span className="text-white font-medium text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((prev) => Math.min(4, prev + 0.5))} className="p-3 hover:bg-neutral-800 rounded-full text-neutral-300 transition-colors"><IconZoomIn size={24} /></button>
            </div>

            {/* Botón de Cerrar unificado */}
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white z-50 bg-black/50 p-2 rounded-full" 
              onClick={() => { setIsArchitectureModalOpen(false); setTimeout(() => setZoom(1), 300); }}
            >
              <IconX size={32} />
            </button>

            {/* Contenedor de la Imagen con Drag (Arrastre) y Zoom */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: zoom, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              drag={zoom > 1} dragConstraints={{ left: -800 * (zoom - 1), right: 800 * (zoom - 1), top: -400 * (zoom - 1), bottom: 400 * (zoom - 1) }}
              className={`relative w-full max-w-6xl aspect-video flex items-center justify-center bg-neutral-900/30 rounded-2xl ${zoom > 1 ? "cursor-grab" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Image 
                src="/Diagrama de Arquitectura.png" 
                alt="Diagrama de Arquitectura Ampliado" 
                fill 
                className="object-contain pointer-events-none p-4" 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-6 left-6 md:top-10 md:left-10 z-50">
        <Link href="/" className="flex items-center gap-2 px-6 py-2 rounded-full border border-neutral-700 text-neutral-300 text-sm font-medium hover:bg-white hover:text-black transition-all bg-black/40 backdrop-blur-md">
          <IconArrowLeft size={20} /> <span>Volver al Inicio</span>
        </Link>
      </div>

      <div id="" ref={headerRef} className="pt-20 md:pt-24 pb-16 flex flex-col items-center justify-center w-full px-6">
        <div className="w-full max-w-5xl flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">Herramientas y Arquitectura</h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 font-light mb-12">Explora el stack tecnológico detrás de A.C.E. V.2.0</p>
          
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 w-full">
            <Card title="Base de Datos" active={active === "db"} onClick={() => scrollTo("db", dbRef)} config={dbConfig}>
              <div className="relative w-48 h-48 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Image src="/postgresql_logo_icon.png" alt="PostgreSQL" fill className="object-contain" />
              </div>
            </Card>
            <Card title="Backend" active={active === "backend"} onClick={() => scrollTo("backend", backendRef)} config={backendConfig}>
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-35 h-35 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]"><Image src="/java_logo_icon.png" alt="Java" fill className="object-contain" /></div>
                <div className="relative w-40 h-20 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]"><Image src="/spring_boot_logo_icon.png" alt="Spring Boot" fill className="object-contain" /></div>
              </div>
            </Card>
            <Card title="Frontend" active={active === "frontend"} onClick={() => scrollTo("frontend", frontendRef)} config={frontendConfig}>
              <div className="relative w-48 h-48 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <Image src="/nextjs_logo_icon.png" alt="Next.js" fill className="object-contain" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* SECCIÓN BASE DE DATOS */}
        <Section id="db" refProp={dbRef} title="Base de Datos">
          <div className="flex flex-col lg:flex-row gap-12 items-start mt-6">
                        {/* Columna Izquierda: Texto descriptivo */}
            <div className="flex-1 space-y-10">
              
              {/* Punto 1 */}
              <div>
                <h3 className="text-xl font-bold text-blue-400 flex items-center gap-3 mb-3">
                  <IconDatabase size={34} /> Enfoque Relacional y Motor
                </h3>
                <p className="text-neutral-400 leading-relaxed text-base md:text-lg font-light">
                  El corazón del sistema A.C.E. requiere garantizar la consistencia, integridad y trazabilidad. Por ello, la capa de persistencia está diseñada sobre un modelo de <strong className="text-neutral-200 font-medium">Base de Datos Relacional (RDBMS)</strong>, utilizando <strong className="text-neutral-200 font-medium">PostgreSQL</strong> por su robustez, cumplimiento del estándar ACID y excelente rendimiento.
                </p>
              </div>

              {/* Punto 2 */}
              <div>
                <h3 className="text-xl font-bold text-blue-400 flex items-center gap-3 mb-3">
                  <IconCloud size={34} /> Infraestructura en la Nube
                </h3>
                <p className="text-neutral-400 leading-relaxed text-base md:text-lg font-light">
                  Dejando atrás las bases de datos locales, esta versión da un salto hacia el Cloud Computing utilizando <strong className="text-neutral-200 font-medium">Supabase</strong>. Esta plataforma nos provee un entorno gestionado (DBaaS), lo que garantiza alta disponibilidad, copias de seguridad automatizadas y la capacidad de escalar la infraestructura ágilmente.
                </p>
              </div>

              {/* Punto 3 */}
              <div>
                <h3 className="text-xl font-bold text-blue-400 flex items-center gap-3 mb-3">
                  <IconLock size={34} /> Integración Segura
                </h3>
                <p className="text-neutral-400 leading-relaxed text-base md:text-lg font-light">
                  La comunicación con la API se realiza a través de <strong className="text-neutral-200 font-medium">Spring Data JPA e Hibernate</strong> (ORM), mapeando las tablas directamente a objetos en Java y previniendo vulnerabilidades como la Inyección SQL.
                </p>
              </div>

              {/* Punto 4 */}
              <div>
                <h3 className="text-xl font-bold text-blue-400 flex items-center gap-3 mb-3">
                  <IconSitemap size={34} /> Arquitectura y Evolución
                </h3>
                <p className="text-neutral-400 leading-relaxed text-base md:text-lg font-light mb-4">
                  El modelo fue normalizado para reflejar la operativa diaria, pero se mantiene en constante evolución. Recientemente ampliamos el esquema para soportar <strong className="text-neutral-200 font-medium">fotos de perfil (Avatares)</strong>. El esquema central se compone de:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-300 text-sm md:text-base font-light">
                  <li><strong className="text-blue-300 font-medium">Usuarios y Playeros:</strong> Gestión de accesos y perfiles personalizados.</li>
                  <li><strong className="text-blue-300 font-medium">Abonados y Vehículos:</strong> Registro de clientes frecuentes y sus patentes.</li>
                  <li><strong className="text-blue-300 font-medium">Plazas:</strong> Mapeo físico de la capacidad del estacionamiento.</li>
                  <li><strong className="text-blue-300 font-medium">Tickets y Tarifas:</strong> Motor de cálculo dinámico de cobros por estadía.</li>
                </ul>
              </div>
            </div>

            <div className="flex-1 w-full lg:sticky lg:top-40 flex flex-col gap-6">
              <div className="w-full aspect-[4/3] rounded-2xl border border-blue-900/30 bg-blue-950/10 relative overflow-hidden group cursor-zoom-in shadow-2xl" onClick={() => setIsModalOpen(true)}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none z-10" />
                <Image src="/der_estace.png" alt="DER EstACE" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm z-20"><span className="bg-white/10 px-4 py-2 rounded-full text-white text-sm border border-white/20 font-medium">Click para ampliar</span></div>
              </div>
              <a href="/der_estace.pdf" download="DER_EstACE.pdf" className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-red-600/10 hover:bg-red-600 border border-red-500/50 text-red-500 hover:text-white font-bold transition-all group">
                <IconFileTypePdf size={24} className="group-hover:scale-110 transition-transform" /> Descargar DER como PDF <IconDownload size={20} className="ml-2 opacity-50" />
              </a>
            </div>
          </div>
        </Section>

        {/* SECCIÓN BACKEND */}
        <Section id="backend" refProp={backendRef} title="Backend">
          <div className="flex flex-col lg:flex-row gap-12 items-start mt-6">
            
            {/* Columna Izquierda: Texto descriptivo */}
            <div className="flex-1 space-y-10 text-base md:text-lg">
              
              {/* Punto 1 */}
              <div>
                <h3 className="text-xl font-bold text-red-400 flex items-center gap-3 mb-3">
                  <IconCoffee size={34} /> Núcleo en Java 17
                </h3>
                <p className="text-neutral-400 font-light leading-relaxed">
                  Toda la lógica de negocio está desarrollada utilizando <strong className="text-neutral-200">Java 17</strong>, aprovechando las ventajas de la Programación Orientada a Objetos para crear un código modular, mantenible y escalable.
                </p>
              </div>

              {/* Punto 2 */}
              <div>
                <h3 className="text-xl font-bold text-green-400 flex items-center gap-3 mb-3">
                  <IconLeaf size={34} /> Framework Spring Boot 3
                </h3>
                <p className="text-neutral-400 font-light leading-relaxed">
                La arquitectura aprovecha al máximo el ecosistema Spring. Utiliza <strong className="text-neutral-200">Spring Web</strong> para la creación de una API RESTful robusta y <strong className="text-neutral-200">Spring Data JPA</strong> para la persistencia de datos. La seguridad está garantizada mediante <strong className="text-neutral-200">Spring Security</strong> junto con <strong className="text-neutral-200">JWT (jjwt-api)</strong>, logrando una autenticación "Stateless" y un estricto control de accesos basado en roles.                </p>
              </div>

              {/* Punto 3 */}
              <div>
                <h3 className="text-xl font-bold text-blue-400 flex items-center gap-3 mb-3">
                  <IconBrandDocker size={34} /> Despliegue con Docker y Render
                </h3>
                <p className="text-neutral-400 font-light leading-relaxed">
                  Para estandarizar los entornos de desarrollo y producción, la aplicación backend se encuentra <strong className="text-neutral-200">contenerizada utilizando Docker</strong>. La imagen resultante está desplegada de forma continua (CI/CD) en la nube a través de <strong className="text-neutral-200">Render</strong>, asegurando que el sistema se ejecute de manera consistente, escalable y con alta disponibilidad independientemente de la infraestructura subyacente.
                </p>
              </div>

              {/* Punto 4 */}
              <div>
                <h3 className="text-xl font-bold text-green-400 flex items-center gap-3 mb-3">
                  <IconHierarchy size={34} /> Spring Starters y Librerías
                </h3>
                <p className="text-neutral-400 font-light mb-4 leading-relaxed">
                  El proyecto implementa un patrón de diseño multicapa (Controladores, Servicios, Repositorios) y emplea múltiples dependencias del entorno Spring Boot para extender sus funcionalidades:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-300 text-sm md:text-base font-light">
                  <li><strong className="text-green-300 font-medium">Spring Boot Validation:</strong> Sanitización y validación estricta de los DTOs de entrada.</li>
                  <li><strong className="text-green-300 font-medium">Spring Boot Mail:</strong> Integración para el envío automatizado de correos electrónicos.</li>
                  <li><strong className="text-green-300 font-medium">Spring Boot Test:</strong> Entorno preparado para pruebas y seguridad (MockMvc).</li>
                  <li><strong className="text-green-300 font-medium">Lombok:</strong> Reducción de código repetitivo (Boilerplate) para mantener las entidades limpias.</li>
                </ul>
              </div>
            </div>

            {/* COLUMNA DERECHA: DIAGRAMA DE ARQUITECTURA Y BOTÓN GITHUB */}
            <div className="flex-1 w-full lg:sticky lg:top-40 flex flex-col gap-6">
              
              {/* Contenedor de la Imagen con Zoom */}
              <div 
                className="w-full aspect-[4/3] rounded-2xl border border-green-900/30 bg-neutral-900 relative overflow-hidden group cursor-zoom-in shadow-[0_0_30px_rgba(34,197,94,0.15)]"
                onClick={() => setIsArchitectureModalOpen(true)}
              >
                {/* Filtro de iluminación verde superpuesto */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none z-10" />
                
                {/* Imagen del Diagrama */}
                <Image 
                  src="/Diagrama de Arquitectura.png" 
                  alt="Diagrama de Arquitectura Backend" 
                  fill 
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-700" 
                />

                {/* Overlay de "Click para ampliar" (Aparece en Hover) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm z-20">
                  <span className="bg-white/10 px-4 py-2 rounded-full text-white text-sm border border-white/20 font-medium">
                    Click para ampliar
                  </span>
                </div>
              </div>

              {/* Botón hacia GitHub */}
              <a 
                href="https://github.com/CCrisstian/EstACE_V2_Backend" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold transition-all group shadow-xl"
              >
                <IconBrandGithub size={34} className="group-hover:scale-110 transition-transform" />
                Ver Código Fuente en GitHub
              </a>
            </div>
          </div>
        </Section>

        {/* SECCIÓN FRONTEND */}
        <Section id="frontend" refProp={frontendRef} title="Frontend">
          <div className="flex flex-col gap-10 mt-6 max-w-4xl">
            
            {/* Punto 1: Framework */}
            <div>
              <h3 className="text-xl font-bold text-neutral-200 flex items-center gap-3 mb-3">
                <IconBrandNextjs size={34} className="text-white" /> Framework React & Next.js
              </h3>
              <p className="text-neutral-400 font-light leading-relaxed text-base md:text-lg">
                La interfaz de usuario está construida sobre <strong className="text-neutral-200">React 19</strong> y el framework <strong className="text-neutral-200">Next.js 16</strong>. Esta arquitectura permite una experiencia de navegación fluida y optimizada, gestionando estados complejos del lado del cliente y garantizando tiempos de carga mínimos.
              </p>
            </div>

            {/* Punto 2: Estética */}
            <div>
              <h3 className="text-xl font-bold text-neutral-200 flex items-center gap-3 mb-3">
                <IconBrandTailwind size={34} className="text-white" /> Estilos y Animaciones
              </h3>
              <p className="text-neutral-400 font-light leading-relaxed text-base md:text-lg">
                El diseño visual se apoya en <strong className="text-neutral-200">Tailwind CSS v4</strong> para un desarrollo ágil y consistente, con un enfoque "Mobile First". Las interacciones y micro-animaciones dinámicas que dan vida a la plataforma están impulsadas por <strong className="text-neutral-200">Framer Motion</strong>.
              </p>
            </div>

            {/* Punto 3: Geo */}
            <div>
              <h3 className="text-xl font-bold text-neutral-200 flex items-center gap-3 mb-3">
                <IconMap size={34} className="text-white" /> Mapas Interactivos
              </h3>
              <p className="text-neutral-400 font-light leading-relaxed text-base md:text-lg">
                Para la visualización geográfica de los estacionamientos, se implementaron mapas mediante <strong className="text-neutral-200">Leaflet y React-Leaflet</strong>. Esto permite a los usuarios ubicar sucursales con precisión y gestionar coordenadas espaciales de forma visual.
              </p>
            </div>

            {/* Punto 4: Hosting */}
            <div>
              <h3 className="text-xl font-bold text-neutral-200 flex items-center gap-3 mb-3">
                <IconBrandVercel size={34} className="text-white" /> Despliegue en Vercel
              </h3>
              <p className="text-neutral-400 font-light leading-relaxed text-base md:text-lg">
                El proyecto está alojado en la infraestructura de <strong className="text-neutral-200">Vercel</strong>, aprovechando sus capacidades de integración continua para reflejar cambios en tiempo real y asegurar una disponibilidad global constante.
              </p>
            </div>

            {/* Botón GitHub Frontend */}
            <div className="pt-4">
              <a 
                href="https://github.com/CCrisstian/EstACE-Frontend" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white hover:bg-neutral-200 border border-neutral-200 text-black font-bold transition-all group shadow-xl"
              >
                <IconBrandGithub size={34} className="group-hover:scale-110 transition-transform" />
                Ver Código Fuente en GitHub
              </a>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}