"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// UI
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconChevronLeft, IconPlus, IconPencil, IconSearch } from "@tabler/icons-react";

// Servicios / tipos
import { obtenerPerfil } from "@/services/userService";
import { UsuarioResponse } from "@/types/usuario.types";

export default function EstacionamientosListPage() {
  const [open, setOpen] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);

  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await obtenerPerfil(token);
          setUsuario(userData);
        } catch (e) {
          console.error(e);
        }
      }
    };
    initData();
  }, []);

  const links = [
    {
      label: "Volver al Inicio",
      href: "/dashboard",
      icon: (
        <IconChevronLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-900 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      {/* SIDEBAR */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden mt-2">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-4 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <SidebarLink
            link={{
              label: usuario
                ? `${usuario.nombre} ${usuario.apellido}`
                : "Usuario",
              href: "/perfil",
              icon: (
                <div className="h-7 w-7 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-xs font-bold text-white">
                  {usuario?.nombre?.charAt(0) || "U"}
                </div>
              ),
            }}
          />
        </SidebarBody>
      </Sidebar>

      {/* CONTENIDO */}
      <div className="flex-1 w-full h-full overflow-hidden bg-white dark:bg-neutral-900">
        <div className="w-full h-full overflow-y-auto p-4 md:p-10">
          <div className="max-w-6xl mx-auto mt-6">
            {/* TÍTULO + BOTÓN */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                Estacionamientos
              </h2>

              <div className="mt-4">
                <Link href="/estacionamientos/crear-editar">
                  <button
                    type="button"
                    className="relative inline-flex h-12 overflow-hidden rounded-full p-[6px]
                               focus:outline-none focus:ring-2 focus:ring-green-400
                               focus:ring-offset-2 focus:ring-offset-slate-50"
                  >
                    <span
                      className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite]
                                 bg-[conic-gradient(from_90deg_at_50%_50%,#4ADE80_0%,#16A34A_50%,#4ADE80_100%)]"
                    />
                    <span
                      className="inline-flex h-full w-full items-center justify-center gap-2
                                 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium
                                 text-green-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors"
                    >
                      <IconPlus size={25} />
                      Agregar Estacionamiento
                    </span>
                  </button>
                </Link>
              </div>
            </div>

            {/* TABLA */}
            <div className="bg-white dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm">
              {/* BUSCADOR */}
              <div className="p-4 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/80 flex items-center gap-2">
                <IconSearch size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o dirección..."
                  className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 w-full placeholder-gray-400"
                />
              </div>

              {/* TABLA */}
              <div className="overflow-x-auto">
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
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-gray-400 dark:text-gray-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-3 bg-gray-100 dark:bg-neutral-800 rounded-full">
                            <IconPencil size={24} className="opacity-50" />
                          </div>
                          <p>Aún no tienes estacionamientos registrados.</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// LOGOS
export const Logo = () => (
  <Link
    href="/dashboard"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
  >
    <div className="h-8 w-8 relative overflow-hidden rounded-full flex-shrink-0">
      <Image
        src="/LogoACE_SinFondo.png"
        alt="Logo EstACE"
        fill
        className="object-cover"
      />
    </div>
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-medium text-black dark:text-white whitespace-pre"
    >
      EstACE V2
    </motion.span>
  </Link>
);

export const LogoIcon = () => (
  <Link
    href="/dashboard"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
  >
    <div className="h-8 w-8 relative overflow-hidden rounded-full flex-shrink-0">
      <Image
        src="/LogoACE_SinFondo.png"
        alt="Logo EstACE"
        fill
        className="object-cover"
      />
    </div>
  </Link>
);
