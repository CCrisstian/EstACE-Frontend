"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Iconos locales de la página
import {
  IconPlus,
  IconPencil,
  IconSearch,
  IconEdit,
  IconLoader2,
  IconCircleCheck,
  IconXboxX,
  IconStarFilled,
  IconEye,  
  IconX,
  IconMapPin,
  IconClock,
  IconCalendar
} from "@tabler/icons-react";

// Importamos Wrapper
import { AppSidebar } from "@/components/AppSidebar"; 

// Servicios y Tipos
import { obtenerMisEstacionamientos } from "@/services/estacionamientoService";
import { Estacionamiento } from "@/types/estacionamiento.types";

export default function EstacionamientosListPage() {
  const router = useRouter();

  // Estados de datos
  const [estacionamientos, setEstacionamientos] = useState<Estacionamiento[]>([]);
  const [selectedEstacionamiento, setSelectedEstacionamiento] = useState<Estacionamiento | null>(null); // <-- Estado para el modal
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- EFECTOS ---
  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        router.push("/"); 
        return;
      }

      try {
        const data = await obtenerMisEstacionamientos(token);
        setEstacionamientos(data);
      } catch (e) {
        console.error("Error cargando datos:", e);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [router]);

  // --- LÓGICA DE FILTRADO ---
  const filteredEstacionamientos = estacionamientos.filter(est => 
    est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.localidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppSidebar>
      <div className="flex-1 w-full h-full overflow-hidden bg-white dark:bg-neutral-900">
        <div className="w-full h-full overflow-y-auto p-4 md:p-10">
          <div className="max-w-6xl mx-auto mt-6">
            
            {/* ENCABEZADO */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Mis Estacionamientos
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Gestiona y visualiza tus Estacionamientos registrados.
                </p>
              </div>

              {/* Solo mostramos el botón si NO tiene estacionamientos */}
              {estacionamientos.length === 0 && (
                <Link href="/estacionamientos/crear-editar">
                  <button
                    type="button"
                    className="relative inline-flex h-12 overflow-hidden rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-50 shadow-lg transition-transform hover:scale-105 active:scale-95"
                  >
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#4ADE80_0%,#16A34A_50%,#4ADE80_100%)]" />
                    <span className="inline-flex h-full w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-green-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                      <IconPlus size={25} />
                      Agregar Nuevo
                    </span>
                  </button>
                </Link>
              )}
            </div>

            {/* TABLA Y BUSCADOR */}
            <div className="bg-white dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm">
              
              {/* Buscador */}
              <div className="p-4 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/80 flex items-center gap-3">
                <IconSearch size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, dirección o localidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 w-full placeholder-gray-400"
                />
                {loading && <IconLoader2 className="animate-spin text-blue-500 h-5 w-5" />}
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-100 dark:bg-neutral-800 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Nombre</th>
                      <th className="px-6 py-4">Provincia</th>
                      <th className="px-6 py-4">Localidad</th>
                      <th className="px-6 py-4">Dirección</th>
                      <th className="px-6 py-4 text-center">Puntaje</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                    
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-20 text-center">
                           <div className="flex flex-col items-center justify-center gap-3">
                              <IconLoader2 className="h-8 w-8 animate-spin text-blue-500" />
                              <span className="text-gray-400">Cargando tus estacionamientos...</span>
                           </div>
                        </td>
                      </tr>
                    ) : filteredEstacionamientos.length === 0 ? (
                      
                      <tr>
                        <td colSpan={7} className="px-6 py-20 text-center text-gray-400 dark:text-gray-500">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-gray-100 dark:bg-neutral-800 rounded-full">
                              <IconPencil size={32} className="opacity-40" />
                            </div>
                            <p className="text-lg font-medium">No se encontraron estacionamientos</p>
                            <p className="text-sm opacity-70">
                                {searchTerm ? "Intenta con otra búsqueda." : "Aún no has registrado ningún Estacionamiento."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      
                      filteredEstacionamientos.map((est) => (
                        <tr key={est.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {est.nombre}
                          </td>
                          <td className="px-6 py-4">{est.provincia}</td>
                          <td className="px-6 py-4">{est.localidad}</td>
                          <td className="px-6 py-4">{est.direccion}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 font-semibold text-yellow-600 dark:text-yellow-500">
                                <span>{est.puntaje}</span>
                                <IconStarFilled size={14} fill="currentColor" />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                                {est.disponibilidad ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        <IconCircleCheck size={12} /> Disponible
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                        <IconXboxX size={12} /> No Disp.
                                    </span>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                {/* Botón Ver Detalle (Ojo) */}
                                <button
                                    onClick={() => setSelectedEstacionamiento(est)}
                                    className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
                                    title="Ver Detalles"
                                >
                                    <IconEye size={18} />
                                </button>

                                {/* Botón Editar */}
                                <Link 
                                    href={`/estacionamientos/crear-editar?id=${est.id}`}
                                    className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    title="Editar Estacionamiento"
                                >
                                    <IconEdit size={18} />
                                </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* --- MODAL DE DETALLES --- */}
        {selectedEstacionamiento && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    
                    {/* Header del Modal */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-neutral-800">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {selectedEstacionamiento.nombre}
                            </h3>
                        </div>
                        <button 
                            onClick={() => setSelectedEstacionamiento(null)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 transition-colors"
                        >
                            <IconX size={24} />
                        </button>
                    </div>

                    {/* Cuerpo del Modal (Scrollable) */}
                    <div className="p-6 overflow-y-auto space-y-8">
                        
                        {/* 1. Información Principal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ubicación</h4>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                        <IconMapPin size={14} /> {selectedEstacionamiento.provincia}, {selectedEstacionamiento.localidad}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold">Dirección:</span> {selectedEstacionamiento.direccion}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</h4>
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${selectedEstacionamiento.disponibilidad ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {selectedEstacionamiento.disponibilidad ? <IconCircleCheck size={14}/> : <IconXboxX size={14}/>}
                                        {selectedEstacionamiento.disponibilidad ? 'Disponible' : 'No Disponible'}
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 font-bold bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full text-xs">
                                        <IconStarFilled size={14} />
                                        {selectedEstacionamiento.puntaje} Puntos
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Horarios */}
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <IconClock className="text-blue-500" size={20} /> Horarios de Atención
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Días Hábiles</p>
                                    <p className="text-base text-gray-800 dark:text-gray-200 font-semibold">{selectedEstacionamiento.diasAtencion}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEstacionamiento.hraAtencion}</p>
                                </div>
                                <div className={`border border-gray-200 dark:border-neutral-700 rounded-lg p-4 ${!selectedEstacionamiento.finDeSemanaAtencion && 'opacity-50 grayscale'}`}>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Fines de Semana</p>
                                    {selectedEstacionamiento.finDeSemanaAtencion ? (
                                        <>
                                            <p className="text-base text-gray-800 dark:text-gray-200 font-semibold">Sábados y Domingos</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEstacionamiento.horaFinDeSemana}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">No atiende fines de semana</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. Información Adicional */}
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <IconCalendar className="text-blue-500" size={20} /> Información Adicional
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                <span className={`px-4 py-2 rounded-lg text-sm border ${selectedEstacionamiento.diasFeriadoAtencion ? 'bg-blue-50 border-blue-200 text-purple-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-neutral-800 dark:border-neutral-700'}`}>
                                    {selectedEstacionamiento.diasFeriadoAtencion ? '✓ Atiende Feriados' : '✗ No atiende Feriados'}
                                </span>
                                <span className="px-4 py-2 rounded-lg text-sm border bg-gray-50 border-gray-200 text-gray-600 dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-300">
                                    Votos Totales: {selectedEstacionamiento.cantidadVotos}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )}

      </div>
    </AppSidebar>
  );
}