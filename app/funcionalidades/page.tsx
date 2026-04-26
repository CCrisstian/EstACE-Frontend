"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconArrowLeft,
  IconCar,
  IconParkingCircle,
  IconCarGarage,
  IconCashRegister,
  IconBusinessplan,
  IconUsersGroup,
  IconHistoryToggle,
  IconFileInvoice,
  IconReportAnalytics,
  IconPointer
} from "@tabler/icons-react";

// --- DATOS DE LAS FUNCIONALIDADES ---
const funcionalidades = [
  {
    id: "ingresos",
    title: "Ingresos y Egresos",
    icon: IconCar,
    color: "text-blue-400",
    glow: "rgba(59,130,246,0.5)",
    description: "Gestiona ingresos detectando patentes y abonos para asignar plazas automáticamente. El egreso calcula la estadía con reglas de tolerancia y procesa el cobro."
  },
  {
    id: "estacionamientos",
    title: "Estacionamientos",
    icon: IconParkingCircle,
    color: "text-blue-400",
    glow: "rgba(59,130,246,0.5)",
    description: "Administración multi-sucursal. Integra servicios de geocodificación para mapear ubicaciones exactas y prevenir duplicados. Permite configurar reglas de negocio complejas como horarios diferenciados por fin de semana o feriados."
  },
  {
    id: "plazas",
    title: "Gestión de Plazas",
    icon: IconCarGarage,
    color: "text-blue-400",
    glow: "rgba(59,130,246,0.5)",
    description: "Permite crear, editar y listar plazas. Calcula la disponibilidad evaluando habilitación física, ocupación transitoria y reservas de abonados, generando un dashboard con métricas por categoría en tiempo real."},
  {
    id: "tarifas",
    title: "Motor de Tarifas",
    icon: IconCashRegister,
    color: "text-blue-400",
    glow: "rgba(59,130,246,0.5)",
    description: "Valida restricciones cruzadas para evitar tarifas duplicadas por sucursal, categoría de vehículo y fracción de tiempo. Sella automáticamente las fechas de vigencia para garantizar auditorías contables precisas."
  },
  {
    id: "pagos",
    title: "Métodos de Pago",
    icon: IconBusinessplan,
    color: "text-blue-400",
    glow: "rgba(59,130,246,0.5)",
    description: "Permite habilitar y auditar distintas formas de cobro por sucursal, desde efectivo tradicional hasta billeteras virtuales y tarjetas, integrando reportes de conciliación."
  },
  {
    id: "playeros",
    title: "Playeros",
    icon: IconUsersGroup,
    color: "text-blue-400",
    glow: "rgba(59,130,246,0.5)",
    description: "Control de recursos humanos. Administración del personal operativo, asignación de perfiles de acceso, control de estado y vinculación a sucursales o turnos específicos."
  },
  {
    id: "turnos",
    title: "Control de Turnos",
    icon: IconHistoryToggle,
    color: "text-blue-400",
    glow: "rgba(59,130,246,0.5)",
    description: "Auditoría operativa y de caja. Seguimiento estricto de la apertura y cierre de jornadas por operador, controlando los montos iniciales, la recaudación total acumulada y el arqueo de caja final."
  },
  {
    id: "abonados",
    title: "Abonados",
    icon: IconFileInvoice,
    color: "text-blue-400",
    glow: "rgba(59,130,246,0.5)",
    description: "Fidelización de clientes. Registro de clientes recurrentes, vinculación múltiple de vehículos por titular y gestión automatizada de pagos de abonos mensuales o quincenales con alertas de vencimiento."
  },
  {
    id: "reportes",
    title: "Reportes y Métricas",
    icon: IconReportAnalytics,
    color: "text-blue-400",
    glow: "rgba(59,130,246,0.5)",
    description: "Generación de estadísticas detalladas sobre recaudación neta, horas pico de tráfico, ocupación promedio por categoría y rendimiento del personal."
  }
];

export default function FuncionalidadesPage() {
  const [activeFeature, setActiveFeature] = useState<typeof funcionalidades[0] | null>(null);

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-black font-sans relative pb-12">
      
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

      {/* CABECERA*/}
      <div className="pt-16 md:pt-16 pb-8 flex flex-col items-center justify-center w-full px-6">
        <div className="w-full max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            Funcionalidades
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 font-light max-w-2xl mx-auto">
            Pasa el cursor sobre cada módulo para descubrir cómo el sistema A.C.E. V2.0 resuelve los desafíos diarios de un Estacionamiento.
          </p>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
        
        {/* COLUMNA IZQUIERDA: GRILLA */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {funcionalidades.map((feature) => {
            const Icono = feature.icon;
            const isHovered = activeFeature?.id === feature.id;

            return (
              <div
                key={feature.id}
                onMouseEnter={() => setActiveFeature(feature)}
                onClick={() => setActiveFeature(feature)}
                className={`
                  relative overflow-hidden cursor-pointer rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 border
                  ${isHovered 
                    ? "bg-white/10 border-neutral-400 dark:border-neutral-600 scale-105 shadow-2xl" 
                    : "bg-neutral-100 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 hover:border-neutral-600"
                  }
                `}
                style={{
                  boxShadow: isHovered ? `0 0 20px ${feature.glow}` : 'none'
                }}
              >
                <Icono 
                  size={36} 
                  stroke={1.5} 
                  className={`transition-colors duration-300 ${isHovered ? feature.color : "text-neutral-500"}`} 
                />
                <h3 className={`text-sm font-semibold transition-colors duration-300 ${isHovered ? "text-white" : "text-neutral-400"}`}>
                  {feature.title}
                </h3>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-40 h-[350px] w-full">
          
          <AnimatePresence mode="wait">
            {activeFeature ? (
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="h-full w-full rounded-3xl border border-neutral-700 bg-neutral-900/80 backdrop-blur-xl p-6 flex flex-col justify-start relative overflow-hidden shadow-2xl"
              >
                <div 
                  className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
                  style={{ backgroundColor: activeFeature.glow.replace('0.5', '1') }}
                />

                <div className="relative z-10">
                  <activeFeature.icon size={56} stroke={1.5} className={`${activeFeature.color} mb-3`} />
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {activeFeature.title}
                  </h2>
                  <p className="text-neutral-300 text-base md:text-lg leading-relaxed font-light">
                    {activeFeature.description}
                  </p>
                </div>
              </motion.div>

            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/30 p-8 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4">
                  <IconPointer size={28} className="text-neutral-500" />
                </div>
                <h3 className="text-xl font-medium text-neutral-400 mb-2">
                  Explora los Módulos
                </h3>
                <p className="text-neutral-500 text-sm max-w-[250px]">
                  Pasa el cursor sobre cualquiera de las tarjetas de la izquierda para ver los detalles técnicos de la funcionalidad.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}