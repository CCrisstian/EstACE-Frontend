"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { 
  IconPlus, IconSearch, IconEdit, IconLoader2, 
  IconUser, IconCircleCheck, IconXboxX 
} from "@tabler/icons-react";

import { obtenerMisPlayeros } from "@/services/playeroService";
import { Playero } from "@/types/playero.types";

import RoleGuard from "@/components/RoleGuard";

import Image from "next/image";

export default function PlayerosListPage() {
  const router = useRouter();
  const [playeros, setPlayeros] = useState<Playero[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPlayeros = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      try {
        const data = await obtenerMisPlayeros(token);
        setPlayeros(data);
      } catch (error) {
        // Logueamos el error pero no bloqueamos la UI
        console.error("Fallo al cargar playeros:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayeros();
  }, [router]);

  // Filtro por Nombre, Apellido o DNI
  const filteredPlayeros = playeros.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.dni).includes(searchTerm)
  );

  return (
    <RoleGuard allowedRoles={["Dueño"]}>
      <AppSidebar>
        <div className="flex-1 w-full h-full overflow-hidden bg-white dark:bg-neutral-900">
          <div className="w-full h-full overflow-y-auto p-4 md:p-10">
            <div className="max-w-6xl mx-auto mt-6">
              
              <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Playeros</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Administra a tus Playeros.</p>
                </div>
                
                <Link href="/playeros/crear-editar">
                  <button className="relative inline-flex h-12 overflow-hidden rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg transition-transform hover:scale-105 active:scale-95">
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#4ADE80_0%,#16A34A_50%,#4ADE80_100%)]" />
                    <span className="inline-flex h-full w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-green-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                      <IconPlus size={20} /> Nuevo Playero
                    </span>
                  </button>
                </Link>
              </div>

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
                    <thead className="bg-gray-100 dark:bg-neutral-800 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                      <tr>
                        <th className="px-6 py-4">Playero</th>
                        <th className="px-6 py-4">Legajo</th>
                        <th className="px-6 py-4">DNI</th>
                        <th className="px-6 py-4">Estacionamiento</th>
                        <th className="px-6 py-4 text-center">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                      {loading ? (
                        <tr><td colSpan={6} className="px-6 py-20 text-center"><IconLoader2 className="animate-spin h-8 w-8 mx-auto text-blue-500"/></td></tr>
                      ) : filteredPlayeros.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400">No se encontraron Playeros.</td></tr>
                      ) : (
                        filteredPlayeros.map((p) => (
                          <tr key={p.legajo} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
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
                                    <div className="h-full w-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                      {p.nombre.charAt(0)}{p.apellido.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                {/* Nombre */}
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
                              {p.activo ? 
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><IconCircleCheck size={12}/> Activo</span> :
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><IconXboxX size={12}/> Inactivo</span>
                              }
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link href={`/playeros/crear-editar?id=${p.legajo}`} className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
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
      </AppSidebar>
    </RoleGuard>  
  );
}