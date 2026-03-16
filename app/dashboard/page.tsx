"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Iconos
import { 
    IconChevronLeft, 
    IconChevronRight, 
    IconMapPin, 
    IconCheck, 
    IconAlertTriangle, 
    IconX, 
    IconInfoCircle,
    IconParkingCircle
} from "@tabler/icons-react";

// Wrapper y Tipos
import { AppSidebar } from "@/components/AppSidebar";
import { UsuarioResponse } from "@/types/usuario.types";
import { Estacionamiento } from "@/types/estacionamiento.types";

// Servicios
import { obtenerPerfil } from "@/services/userService";
import { obtenerEstacionamientosActivos } from "@/services/estacionamientoService";

export default function DashboardPage() {
  const router = useRouter();

  // Estados de datos
  const [user, setUser] = useState<UsuarioResponse | null>(null);
  const [estacionamientos, setEstacionamientos] = useState<Estacionamiento[]>([]);
  const [selectedEstId, setSelectedEstId] = useState<number | null>(null);

  // Estados de UI
  const [showModal, setShowModal] = useState(false);
  const [pendingEst, setPendingEst] = useState<Estacionamiento | null>(null);
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Estado para saber si el modal es para seleccionar o deseleccionar
  const [isDeselecting, setIsDeselecting] = useState(false);

  // Referencia para mover el carrusel
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initDashboard = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
          return;
        }

        try {
            // 1. Cargamos el Perfil
            const userData = await obtenerPerfil(token);
            setUser(userData);
            localStorage.setItem("usuario", JSON.stringify(userData));

            // 2. Si es Dueño, cargamos sus estacionamientos activos
            if (userData.tipo === "Dueño") {
                const estData = await obtenerEstacionamientosActivos(token);
                setEstacionamientos(estData);

                // Verificamos si ya tenía uno seleccionado de antes
                const savedEstId = localStorage.getItem("selectedEstId");
                if (savedEstId) {
                    setSelectedEstId(Number(savedEstId));
                }
            }
        } catch (error) {
            console.error("Error inicializando dashboard:", error);
            localStorage.removeItem("token");
            router.push("/");
        }
    };

    initDashboard();
  }, [router]);

  // --- Lógica del Carrusel ---
  const scrollCarousel = (direction: 'left' | 'right') => {
      if (carouselRef.current) {
          const scrollAmount = direction === 'left' ? -320 : 320;
          carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
  };

  // --- Lógica de Selección / Deselección ---
  const handleSelectClick = (est: Estacionamiento) => {
      setPendingEst(est);
      // Si el ID del estacionamiento clicado es el mismo que el activo, significa que quiere deseleccionar
      setIsDeselecting(est.id === selectedEstId);
      setShowModal(true);
  };

  const confirmSelection = () => {
      if (pendingEst) {
          if (isDeselecting) {
              // --- LÓGICA PARA QUITAR LA SELECCIÓN ---
              localStorage.removeItem("selectedEstId");
              localStorage.removeItem("selectedEstNombre");
              setSelectedEstId(null);
              setAlerta({ type: 'success', text: `Selección removida. Ahora verás información de todas tus Estacionamientos.` });
          } else {
              // --- LÓGICA PARA SELECCIONAR ---
              localStorage.setItem("selectedEstId", String(pendingEst.id));
              localStorage.setItem("selectedEstNombre", pendingEst.nombre);
              setSelectedEstId(pendingEst.id);
              setAlerta({ type: 'success', text: `¡Estacionamiento '${pendingEst.nombre}'!` });
          }
          
          // Disparamos un evento global para actualizar el Sidebar
          window.dispatchEvent(new Event("estacionamientoChanged"));
          
          setTimeout(() => setAlerta(null), 4000);
      }
      setShowModal(false);
      setPendingEst(null);
      setIsDeselecting(false);
  };

  if (!user) return null;

  return (
    <AppSidebar>
        <div className="flex-1 w-full h-full overflow-y-auto p-4 md:p-10 bg-gray-50 dark:bg-neutral-900">
            
            <div className="max-w-6xl mx-auto space-y-8 mt-2 md:mt-0">
                
                {/* HEADER Y DATOS EN FILA */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-800 dark:text-white tracking-tight">
                        Bienvenido, <span className="text-blue-600 dark:text-blue-500">{user.nombre}</span>
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800/80 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-sm w-fit">
                        <div className="flex items-center gap-1.5"><span className="font-bold text-neutral-900 dark:text-white">Legajo:</span> {user.legajo}</div>
                        <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-neutral-600"></div>
                        
                        <div className="flex items-center gap-1.5"><span className="font-bold text-neutral-900 dark:text-white">Rol:</span> {user.tipo}</div>
                        <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-neutral-600"></div>
                        
                        <div className="flex items-center gap-1.5"><span className="font-bold text-neutral-900 dark:text-white">Usuario:</span> {user.apellido}, {user.nombre}</div>
                        <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-neutral-600"></div>
                        
                        <div className="flex items-center gap-1.5"><span className="font-bold text-neutral-900 dark:text-white">DNI:</span> {user.dni}</div>
                    </div>
                </div>

                {/* ALERTA DE ÉXITO */}
                <AnimatePresence>
                    {alerta && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="p-4 rounded-xl flex items-center gap-3 shadow-sm border bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400 max-w-2xl"
                        >
                            <IconCheck className="h-5 w-5 flex-shrink-0" />
                            <div className="flex-1 text-sm font-medium">{alerta.text}</div>
                            <button onClick={() => setAlerta(null)} className="opacity-50 hover:opacity-100 transition-opacity"><IconX size={18} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SECCIÓN DEL CARRUSEL */}
                {user.tipo === "Dueño" && (
                    <div className="pt-6 border-t border-gray-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-neutral-800 dark:text-white flex items-center gap-2">
                                    <IconParkingCircle className="text-blue-500" />
                                    Tus Estacionamientos
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Selecciona la sucursal en la que deseas trabajar hoy.</p>
                            </div>

                            {estacionamientos.length > 2 && (
                                <div className="flex gap-2">
                                    <button onClick={() => scrollCarousel('left')} className="p-2 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors">
                                        <IconChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                                    </button>
                                    <button onClick={() => scrollCarousel('right')} className="p-2 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors">
                                        <IconChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {estacionamientos.length === 0 ? (
                            <div className="p-8 text-center bg-white dark:bg-neutral-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 text-gray-500">
                                Aún no tienes estacionamientos activos.
                            </div>
                        ) : (
                            <div 
                                ref={carouselRef}
                                className="flex gap-4 overflow-x-auto snap-x pb-4 pt-2 -mx-4 px-4 md:-mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                            >
                                {estacionamientos.map((est) => {
                                    const isActive = selectedEstId === est.id;

                                    return (
                                        <div 
                                            key={est.id} 
                                            onClick={() => handleSelectClick(est)} 
                                            className={cn(
                                                "relative shrink-0 w-72 md:w-80 snap-start transition-all duration-300 cursor-pointer group",
                                                isActive ? "hover:scale-[1.02]" : "hover:-translate-y-1 hover:shadow-lg opacity-70 hover:opacity-100 grayscale-[30%] hover:grayscale-0"
                                            )}
                                        >
                                            {isActive ? (
                                                <div className="relative overflow-hidden rounded-2xl p-[3px] shadow-lg h-full">
                                                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#4ADE80_0%,#16A34A_50%,#4ADE80_100%)]" />
                                                    <div className="relative h-full w-full bg-white dark:bg-neutral-900 rounded-[13px] p-5 flex flex-col gap-3">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{est.nombre}</h4>
                                                            <IconCheck className="text-green-500 shrink-0 bg-green-100 dark:bg-green-900/30 p-1 rounded-full" size={26} />
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                                                            <IconMapPin size={16} className="shrink-0 mt-0.5 text-green-500" />
                                                            <p className="line-clamp-2">{est.direccion}, {est.localidad}, {est.provincia}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="absolute inset-[3px] bg-black/10 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[13px] flex items-center justify-center backdrop-blur-[2px] z-10">
                                                        <span className="bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 font-bold px-4 py-2 rounded-full text-sm flex items-center gap-1.5 shadow-lg border border-red-100 dark:border-red-900">
                                                            <IconX size={18} stroke={3} /> Quitar selección
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full w-full bg-white dark:bg-neutral-800/80 rounded-2xl p-5 border border-gray-200 dark:border-neutral-700 shadow-sm flex flex-col gap-3">
                                                    <h4 className="font-bold text-lg text-gray-700 dark:text-gray-200 line-clamp-1">{est.nombre}</h4>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                                                        <IconMapPin size={16} className="shrink-0 mt-0.5" />
                                                        <p className="line-clamp-2">{est.direccion}, {est.localidad}, {est.provincia}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* MODAL DE CONFIRMACIÓN */}
        {showModal && pendingEst && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="relative w-full max-w-md rounded-2xl p-2 bg-yellow-400 shadow-2xl animate-in fade-in zoom-in duration-300">
                    <div className="bg-white dark:bg-neutral-900 rounded-[14px] w-full h-full p-8 flex flex-col items-center text-center">
                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
                            <IconAlertTriangle className="h-20 w-20 text-yellow-500 relative z-10" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                            {isDeselecting ? "Quitar Selección" : "Cambiar de Sucursal"}
                        </h2>
                        
                        <p className="text-neutral-600 dark:text-neutral-300 mb-8">
                            {isDeselecting 
                                ? <>¿Deseas dejar de trabajar exclusivamente en <strong className="text-neutral-900 dark:text-white">'{pendingEst.nombre}'</strong> y ver la información de todos tus estacionamientos?</>
                                : <>¿Deseas seleccionar el estacionamiento <strong className="text-neutral-900 dark:text-white">'{pendingEst.nombre}'</strong> para visualizarlo y administrarlo?</>
                            }
                        </p>
                        
                        <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                            <button type="button" onClick={confirmSelection} className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-blue-400 group">
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#2563EB_50%,#60A5FA_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-blue-400 backdrop-blur-3xl group-hover:bg-slate-900 transition-colors">
                                    <IconCheck size={25} /> Confirmar
                                </span>
                            </button>
                            <button type="button" onClick={() => setShowModal(false)} className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-red-400 group">
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F87171_0%,#DC2626_50%,#F87171_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-red-400 backdrop-blur-3xl group-hover:bg-slate-900 transition-colors">
                                    <IconX size={25} /> Cancelar
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </AppSidebar>
  );
}