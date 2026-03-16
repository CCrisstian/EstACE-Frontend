"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
import { useRouter } from "next/navigation";

// Importamos los iconos necesarios
import { 
  IconLoader2, 
  IconCarGarage, 
  IconPlus, 
  IconEdit,
  IconSearch,         
  IconSelector,       
  IconChevronUp,      
  IconChevronDown,
  IconChartPie,       
  IconX               
} from "@tabler/icons-react";

import { obtenerMisPlazas, obtenerCategorias } from "@/services/plazaService";
import { obtenerMisEstacionamientos } from "@/services/estacionamientoService";

interface PlazaResponse {
  estId: number;
  plazaId: number;
  categoriaId?: number | null;
  nombre?: string | null;
  tipo: string;
  disponibilidad: boolean;
}

type SortKey = keyof PlazaResponse;

export default function PlazasPage() {
  const router = useRouter();
  const [plazas, setPlazas] = useState<PlazaResponse[]>([]);
  
  const [nombresEstacionamientos, setNombresEstacionamientos] = useState<Record<number, string>>({});
  const [nombresCategorias, setNombresCategorias] = useState<Record<number, string>>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  // Estado para guardar el ID del estacionamiento global
  const [globalEstId, setGlobalEstId] = useState<number | null>(null);

  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      // Leemos el estacionamiento seleccionado al cargar la página
      const savedEstId = localStorage.getItem("selectedEstId");
      if (savedEstId) {
          setGlobalEstId(Number(savedEstId));
      }

      try {
        const [plazasData, estData, catData] = await Promise.all([
          obtenerMisPlazas(token),
          obtenerMisEstacionamientos(token),
          obtenerCategorias(token)
        ]);

        const dictEst: Record<number, string> = {};
        estData.forEach((est: any) => { dictEst[est.id] = est.nombre; });
        setNombresEstacionamientos(dictEst);

        const dictCat: Record<number, string> = {};
        catData.forEach((cat: any) => { dictCat[cat.id] = cat.descripcion; });
        setNombresCategorias(dictCat);

        setPlazas(plazasData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [router]);

  // --- LÓGICA DE CONTEXTO GLOBAL ---
  // Si hay un estacionamiento seleccionado, filtramos la lista general primero.
  const plazasDelContexto = globalEstId 
    ? plazas.filter(p => p.estId === globalEstId) 
    : plazas;

  // --- LÓGICA DE FILTRADO ---
  const filteredPlazas = plazasDelContexto.filter(plaza => {
    const term = searchTerm.toLowerCase();
    
    const nombreEst = (nombresEstacionamientos[plaza.estId] || "").toLowerCase();
    const nombreCat = (plaza.categoriaId ? nombresCategorias[plaza.categoriaId] : "").toLowerCase();
    const nombrePlaza = (plaza.nombre || `Plaza #${plaza.plazaId}`).toLowerCase();
    const tipo = plaza.tipo.toLowerCase();

    return (
      nombreEst.includes(term) ||
      nombreCat.includes(term) ||
      nombrePlaza.includes(term) ||
      tipo.includes(term)
    );
  });

  // --- LÓGICA DE ORDENAMIENTO ---
  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPlazas = [...filteredPlazas].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    
    let valA: any = a[key];
    let valB: any = b[key];

    if (key === 'estId') {
        valA = nombresEstacionamientos[a.estId] || "";
        valB = nombresEstacionamientos[b.estId] || "";
    } else if (key === 'categoriaId') {
        valA = a.categoriaId ? nombresCategorias[a.categoriaId] : "";
        valB = b.categoriaId ? nombresCategorias[b.categoriaId] : "";
    } else if (key === 'nombre') {
        valA = a.nombre || `Plaza #${a.plazaId}`;
        valB = b.nombre || `Plaza #${b.plazaId}`;
    }

    if (valA === null || valA === undefined) return direction === 'asc' ? 1 : -1;
    if (valB === null || valB === undefined) return direction === 'asc' ? -1 : 1;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  // --- CÁLCULO DEL RESUMEN DE PLAZAS ---
  const summaryData = useMemo(() => {
    const summary: Record<string, { disponibles: number, ocupadas: number, total: number }> = {};
    let totalDisp = 0;
    let totalOcup = 0;
    let totalGen = 0;

    // Recorremos las plazas DEL CONTEXTO (No la lista original 'plazas')
    plazasDelContexto.forEach(p => {
       const catName = p.categoriaId ? nombresCategorias[p.categoriaId] : "Sin categoría";
       
       if (!summary[catName]) {
           summary[catName] = { disponibles: 0, ocupadas: 0, total: 0 };
       }
       
       if (p.disponibilidad) {
           summary[catName].disponibles++;
           totalDisp++;
       } else {
           summary[catName].ocupadas++;
           totalOcup++;
       }
       summary[catName].total++;
       totalGen++;
    });

    const rows = Object.entries(summary).map(([categoria, counts]) => ({
       categoria,
       ...counts
    })).sort((a, b) => a.categoria.localeCompare(b.categoria));

    return { rows, totalDisp, totalOcup, totalGen };
  }, [plazasDelContexto, nombresCategorias]);


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

  return (
    <AppSidebar>
      <div className="flex-1 w-full h-full overflow-hidden bg-white dark:bg-neutral-900">
        <div className="w-full h-full overflow-y-auto p-4 md:p-10">
          
          {/* HEADER */}
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-4 md:mt-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <IconCarGarage className="h-8 w-8 text-blue-500" />
                Gestión de Plazas
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Gestiona y visualiza tus plazas.
              </p>
            </div>
            
            {/* BOTONES */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSummaryModal(true)}
                className="relative inline-flex h-12 overflow-hidden rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FDE047_0%,#EAB308_50%,#FDE047_100%)]" />
                <span className="inline-flex h-full w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-yellow-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                  <IconChartPie size={20} /> Info de Plazas
                </span>
              </button>

              <Link href="/plazas/crear-editar">
                <button className="relative inline-flex h-12 overflow-hidden rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg transition-transform hover:scale-105 active:scale-95">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#4ADE80_0%,#16A34A_50%,#4ADE80_100%)]" />
                  <span className="inline-flex h-full w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-green-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                    <IconPlus size={20} /> Agregar Plaza
                  </span>
                </button>
              </Link>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
              
              {/* BUSCADOR */}
              <div className="p-4 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/80 flex items-center gap-3">
                <IconSearch size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por estacionamiento, categoría, nombre o tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 w-full placeholder-gray-400"
                />
              </div>

              {/* TABLA */}
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-neutral-800/50 border-b border-gray-200 dark:border-neutral-800 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      {renderSortHeader("Estacionamiento", "estId")}
                      {renderSortHeader("Categoría", "categoriaId")}
                      {renderSortHeader("Nombre / N°", "nombre")}
                      {renderSortHeader("Tipo", "tipo")}
                      {renderSortHeader("Estado", "disponibilidad")}
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                          <IconLoader2 className="animate-spin h-8 w-8 mx-auto text-blue-500" />
                          <p className="mt-2 text-gray-500">Cargando plazas...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center text-red-500">
                          {error}
                        </td>
                      </tr>
                    ) : sortedPlazas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                          {searchTerm 
                            ? "No se encontraron plazas con esa búsqueda." 
                            : (globalEstId ? "No tienes plazas registradas en este estacionamiento." : "No tienes plazas registradas en tus estacionamientos.")}
                        </td>
                      </tr>
                    ) : (
                      sortedPlazas.map((plaza) => (
                        <tr key={`${plaza.estId}-${plaza.plazaId}`} className="hover:bg-gray-50 dark:hover:bg-neutral-800/20 transition-colors">
                          <td className="px-6 py-4 text-gray-800 dark:text-gray-300 font-medium text-sm">
                            {nombresEstacionamientos[plaza.estId] || `ID: ${plaza.estId}`}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                            {plaza.categoriaId ? nombresCategorias[plaza.categoriaId] : "Sin categoría"}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                            {plaza.nombre || `Plaza #${plaza.plazaId}`}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                            <span className="bg-gray-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md">
                              {plaza.tipo}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {plaza.disponibilidad ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                Disponible
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                Ocupada
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link 
                              href={`/plazas/crear-editar?estId=${plaza.estId}&plazaId=${plaza.plazaId}`} 
                              className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Editar Plaza"
                            >
                              <IconEdit size={18} />
                            </Link>
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

      {/* --- MODAL INTERACTIVO DE RESUMEN DE PLAZAS --- */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
            {/* Header del Modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <IconChartPie className="text-yellow-500" /> Información general de Plazas
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total de plazas agrupadas por categoría de vehículo.</p>
                </div>
                <button 
                    onClick={() => setShowSummaryModal(false)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-500 transition-colors"
                >
                    <IconX size={24} />
                </button>
            </div>

            {/* Cuerpo del Modal con la Tabla de Resumen */}
            <div className="p-6 overflow-y-auto">
                <div className="border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                        <thead className="bg-gray-100 dark:bg-neutral-800 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4 text-center text-green-600 dark:text-green-400">Cant. Disponible</th>
                                <th className="px-6 py-4 text-center text-red-600 dark:text-red-400">Cant. Ocupadas</th>
                                <th className="px-6 py-4 text-center font-bold">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                            {summaryData.rows.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">No hay plazas para mostrar.</td></tr>
                            ) : (
                                summaryData.rows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{row.categoria}</td>
                                        <td className="px-6 py-4 text-center">{row.disponibles}</td>
                                        <td className="px-6 py-4 text-center">{row.ocupadas}</td>
                                        <td className="px-6 py-4 text-center font-semibold bg-gray-50/50 dark:bg-neutral-800/20">{row.total}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {/* Totales */}
                        {summaryData.rows.length > 0 && (
                            <tfoot className="bg-gray-100 dark:bg-neutral-800 font-bold text-gray-900 dark:text-white">
                                <tr>
                                    <td className="px-6 py-4 text-right">TOTAL GENERAL:</td>
                                    <td className="px-6 py-4 text-center text-green-600 dark:text-green-400">{summaryData.totalDisp}</td>
                                    <td className="px-6 py-4 text-center text-red-600 dark:text-red-400">{summaryData.totalOcup}</td>
                                    <td className="px-6 py-4 text-center text-lg">{summaryData.totalGen}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

          </div>
        </div>
      )}
    </AppSidebar>
  );
}