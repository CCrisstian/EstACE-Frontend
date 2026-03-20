"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { 
  IconPlus, IconSearch, IconEdit, IconLoader2, 
  IconUser, IconCircleCheck, IconXboxX, IconUsersGroup,
  IconSelector,       
  IconChevronUp,      
  IconChevronDown,
  IconEye,       
  IconX,         
  IconPhone,     
  IconMail,      
  IconMapPin,    
  IconIdBadge2   
} from "@tabler/icons-react";

import { obtenerMisPlayeros } from "@/services/playeroService";
import { Playero } from "@/types/playero.types";

import RoleGuard from "@/components/RoleGuard";

import Image from "next/image";

// Definimos el tipo de clave por la que podemos ordenar
type SortKey = keyof Playero;

export default function PlayerosListPage() {
  const router = useRouter();
  const [playeros, setPlayeros] = useState<Playero[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el Playero seleccionado (Modal)
  const [selectedPlayero, setSelectedPlayero] = useState<Playero | null>(null);
  
  // ESTADO para saber si la foto de perfil está expandida
  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);

  // Estados para el ordenamiento
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  // Estado para guardar el ID del estacionamiento global
  const [globalEstId, setGlobalEstId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlayeros = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const savedEstId = localStorage.getItem("selectedEstId");
      if (savedEstId) {
          setGlobalEstId(Number(savedEstId));
      }

      try {
        const data = await obtenerMisPlayeros(token);
        setPlayeros(data);
      } catch (error) {
        console.error("Fallo al cargar playeros:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayeros();
  }, [router]);

  // --- LÓGICA DE CONTEXTO GLOBAL ---
  const playerosDelContexto = globalEstId 
    ? playeros.filter(p => p.estacionamientoId === globalEstId) 
    : playeros;

  // --- LÓGICA DE FILTRADO (Buscador) ---
  const filteredPlayeros = playerosDelContexto.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.dni).includes(searchTerm)
  );

  // --- LÓGICA DE ORDENAMIENTO ---
  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const sortedPlayeros = [...filteredPlayeros].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    const valA = a[key];
    const valB = b[key];

    if (valA === null || valA === undefined) return direction === 'asc' ? 1 : -1;
    if (valB === null || valB === undefined) return direction === 'asc' ? -1 : 1;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  // --- RENDERIZADOR DE ENCABEZADOS DE TABLA ---
  const renderSortHeader = (label: string, key: SortKey, align: 'left' | 'center' = 'left') => {
    const isSorted = sortConfig?.key === key;
    return (
      <th 
        className="px-6 py-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors select-none group"
        onClick={() => handleSort(key)}
        title={`Ordenar por ${label}`}
      >
        <div className={`flex items-center gap-1 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
          {label}
          <span className={`text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors ${!isSorted ? 'opacity-30 group-hover:opacity-100' : 'text-blue-500 dark:text-blue-400'}`}>
            {isSorted ? (
              sortConfig.direction === 'asc' ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />
            ) : (
              <IconSelector size={16} />
            )}
          </span>
        </div>
      </th>
    );
  };

  // Función para cerrar el modal principal y resetear el estado de la imagen
  const handleCloseModal = () => {
      setSelectedPlayero(null);
      setIsAvatarExpanded(false);
  };

  return (
    <RoleGuard allowedRoles={["Dueño"]}>
      <AppSidebar>
        <div className="flex-1 w-full h-full overflow-hidden bg-white dark:bg-neutral-900">
          <div className="w-full h-full overflow-y-auto p-4 md:p-10">
              
              {/* ENCABEZADO */}
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-4 md:mt-0">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <IconUsersGroup className="h-8 w-8 text-blue-500" />
                    Gestión de Playeros
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Administra a tus Playeros.</p>
                </div>
                
                <Link href="/playeros/crear-editar">
                  <button className="relative inline-flex h-12 overflow-hidden rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg transition-transform hover:scale-105 active:scale-95">
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#4ADE80_0%,#16A34A_50%,#4ADE80_100%)]" />
                    <span className="inline-flex h-full w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-green-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                      <IconPlus size={20} /> Agregar Playero
                    </span>
                  </button>
                </Link>
              </div>

              {/* CONTENEDOR DE LA TABLA */}
              <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/80 flex items-center gap-3">
                    <IconSearch size={18} className="text-gray-400" />
                    <input 
                      type="text" placeholder="Buscar por nombre, apellido o DNI..." 
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 w-full placeholder-gray-400"
                    />
                  </div>

                  <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                      <thead className="bg-gray-100 dark:bg-neutral-800 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-700">
                        <tr>
                          {renderSortHeader("Playero", "nombre")}
                          {renderSortHeader("Legajo", "legajo")}
                          {renderSortHeader("DNI", "dni")}
                          {renderSortHeader("Estacionamiento", "nombreEstacionamiento")}
                          {renderSortHeader("Estado", "activo", "center")}
                          <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                        {loading ? (
                          <tr><td colSpan={6} className="px-6 py-20 text-center"><IconLoader2 className="animate-spin h-8 w-8 mx-auto text-blue-500"/></td></tr>
                        ) : sortedPlayeros.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                              {searchTerm 
                                ? "No se encontraron playeros con esa búsqueda." 
                                : (globalEstId ? "No tienes playeros registrados en este estacionamiento." : "No tienes playeros registrados.")}
                            </td>
                          </tr>
                        ) : (
                          sortedPlayeros.map((p) => (
                            <tr key={p.legajo} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                              {/* CELDA DE NOMBRE + FOTO */}
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                <div className="flex items-center gap-3">
                                  {/* Contenedor del Avatar */}
                                  <div className="relative h-9 w-9 flex-shrink-0 rounded-full overflow-hidden border border-gray-200 dark:border-neutral-700 bg-blue-100 dark:bg-blue-900/30">
                                    {p.avatarUrl ? (
                                      <Image 
                                        src={p.avatarUrl} 
                                        alt={p.nombre} 
                                        fill 
                                        className="object-cover"
                                        sizes="40px"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">
                                        {p.nombre.charAt(0)}{p.apellido.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  {/* Nombre y Apellido */}
                                  <span>{p.nombre} {p.apellido}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                {p.legajo}
                              </td>
                              <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                {p.dni}
                              </td>
                              <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                {p.nombreEstacionamiento || "N/A (Dueño)"}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex justify-center">
                                  {p.activo ? 
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><IconCircleCheck size={12}/> Activo</span> :
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><IconXboxX size={12}/> Inactivo</span>
                                  }
                                </div>
                              </td>
                              {/* COLUMNA DE ACCIONES */}
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  {/* Botón Ver Perfil */}
                                  <button
                                      onClick={() => setSelectedPlayero(p)}
                                      className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
                                      title="Ver Perfil"
                                  >
                                      <IconEye size={18} />
                                  </button>

                                  {/* Botón Editar */}
                                  <Link href={`/playeros/crear-editar?id=${p.legajo}`} className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Editar Playero">
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
        </div>

        {/* --- MODAL DE DETALLES DEL PLAYERO --- */}
        {selectedPlayero && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                    
                    {/* Header del Modal */}
                    <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-neutral-800">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                           <IconUser className="text-blue-500" /> Perfil de Playero
                        </h3>
                        <button 
                            onClick={handleCloseModal}
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 transition-colors"
                        >
                            <IconX size={22} />
                        </button>
                    </div>

                    {/* Cuerpo del Modal */}
                    <div className="p-6 flex flex-col items-center">
                        
                        {/* Foto de Perfil Grande */}
                        <div 
                            className={`h-28 w-28 relative rounded-full overflow-hidden border-4 border-gray-50 dark:border-neutral-800 shadow-md mb-4 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center transition-transform ${selectedPlayero.avatarUrl ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}`}
                            onClick={() => selectedPlayero.avatarUrl && setIsAvatarExpanded(true)}
                            title={selectedPlayero.avatarUrl ? "Clic para ver en grande" : ""}
                        >
                            {selectedPlayero.avatarUrl ? (
                                <Image 
                                    src={selectedPlayero.avatarUrl} 
                                    alt={selectedPlayero.nombre} 
                                    fill 
                                    className="object-cover"
                                    sizes="112px"
                                />
                            ) : (
                                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400 uppercase">
                                    {selectedPlayero.nombre.charAt(0)}{selectedPlayero.apellido.charAt(0)}
                                </span>
                            )}
                        </div>

                        {/* Nombre y Estado */}
                        <h4 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
                            {selectedPlayero.nombre} {selectedPlayero.apellido}
                        </h4>
                        <div className="mt-2 mb-6">
                            {selectedPlayero.activo ? 
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50"><IconCircleCheck size={14}/> Playero Activo</span> :
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50"><IconXboxX size={14}/> Playero Inactivo</span>
                            }
                        </div>

                        {/* Grilla de Datos */}
                        <div className="w-full space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800">
                                <div className="bg-white dark:bg-neutral-700 p-2 rounded-md shadow-sm"><IconIdBadge2 size={18} className="text-blue-500" /></div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Legajo / DNI</p>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">N° {selectedPlayero.legajo} — {selectedPlayero.dni}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800">
                                <div className="bg-white dark:bg-neutral-700 p-2 rounded-md shadow-sm"><IconPhone size={18} className="text-green-500" /></div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Teléfono</p>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{selectedPlayero.telefono || "No registrado"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800">
                                <div className="bg-white dark:bg-neutral-700 p-2 rounded-md shadow-sm"><IconMail size={18} className="text-yellow-500" /></div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Correo Electrónico</p>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{selectedPlayero.email || "No registrado"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800">
                                <div className="bg-white dark:bg-neutral-700 p-2 rounded-md shadow-sm"><IconMapPin size={18} className="text-red-500" /></div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Dirección</p>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{selectedPlayero.direccion || "No registrada"}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL PARA IMAGEN EXPANDIDA (LIGHTBOX) --- */}
        {isAvatarExpanded && selectedPlayero?.avatarUrl && (
            <div 
                className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200 cursor-zoom-out"
                onClick={() => setIsAvatarExpanded(false)}
            >
                {/* Botón de cerrar superior */}
                <button 
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation(); // Evita que se dispare el onClick del fondo
                        setIsAvatarExpanded(false);
                    }}
                >
                    <IconX size={28} />
                </button>
                
                {/* Contenedor de la imagen grande */}
                <div className="relative w-full max-w-2xl aspect-square md:aspect-auto md:h-[80vh] flex items-center justify-center">
                    <Image 
                        src={selectedPlayero.avatarUrl} 
                        alt={selectedPlayero.nombre} 
                        fill 
                        className="object-contain drop-shadow-2xl rounded-lg"
                        sizes="(max-width: 768px) 100vw, 80vw"
                        priority
                    />
                </div>
            </div>
        )}

      </AppSidebar>
    </RoleGuard>  
  );
}