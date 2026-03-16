"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Componentes UI
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";

// Iconos
import {
  IconCar,
  IconParkingCircle,
  IconCarGarage,
  IconCashRegister,
  IconBusinessplan,
  IconUsersGroup,
  IconHistoryToggle,
  IconFileInvoice,
  IconReportAnalytics,
  IconPower,
  IconMapPin 
} from "@tabler/icons-react";

// Servicios y Tipos
import { obtenerPerfil } from "@/services/userService";
import { UsuarioResponse } from "@/types/usuario.types";

export const Logo = () => (
  <Link href="/dashboard" className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
    <div className="h-8 w-8 relative overflow-hidden rounded-full flex-shrink-0">
      <Image src="/LogoACE_SinFondo.png" alt="Logo EstACE" fill className="object-cover" />
    </div>
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium text-black dark:text-white whitespace-pre">
      EstACE V2
    </motion.span>
  </Link>
);

export const LogoIcon = () => (
  <Link href="/dashboard" className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
    <div className="h-8 w-8 relative overflow-hidden rounded-full flex-shrink-0">
      <Image src="/LogoACE_SinFondo.png" alt="Logo EstACE" fill className="object-cover" />
    </div>
  </Link>
);

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  
  // Estado para el estacionamiento global
  const [estacionamientoGlobal, setEstacionamientoGlobal] = useState<string | null>(null);

  useEffect(() => {
    // 1. Cargar Usuario
    const initData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await obtenerPerfil(token);
          setUsuario(userData);
        } catch (e) {
          console.error("Error cargando perfil sidebar:", e);
        }
      }
    };
    initData();

    // 2. Función para actualizar el letrero global
    const updateEstacionamientoGlobal = () => {
      const nombre = localStorage.getItem("selectedEstNombre");
      setEstacionamientoGlobal(nombre);
    };

    updateEstacionamientoGlobal(); // Comprobación inicial
    
    // Escuchamos el evento global que disparamos desde el Dashboard
    window.addEventListener("estacionamientoChanged", updateEstacionamientoGlobal);
    return () => window.removeEventListener("estacionamientoChanged", updateEstacionamientoGlobal);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("selectedEstId"); // Limpiamos el contexto al salir
    localStorage.removeItem("selectedEstNombre");
    router.push("/");
  };

  const handlePending = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Funcionalidad próximamente disponible");
  };

  const links = [
    { label: "Ingresos", href: "#", icon: <IconCar className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />, onClick: handlePending },
    { label: "Estacionamientos", href: "/estacionamientos", icon: <IconParkingCircle className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Plazas", href: "/plazas", icon: <IconCarGarage className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Tarifas", href: "#", icon: <IconCashRegister className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />, onClick: handlePending },
    { label: "Métodos de Pago", href: "#", icon: <IconBusinessplan className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />, onClick: handlePending },
    { label: "Playeros", href: "/playeros", icon: <IconUsersGroup className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Turnos", href: "#", icon: <IconHistoryToggle className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />, onClick: handlePending },
    { label: "Abonados", href: "#", icon: <IconFileInvoice className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />, onClick: handlePending },
    { label: "Reportes", href: "#", icon: <IconReportAnalytics className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />, onClick: handlePending },
    { label: "Cerrar Sesión", href: "#", icon: <IconPower className="h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400" />, onClick: handleLogout },
  ];

  const filteredLinks = links.filter((link) => {
    if (!usuario) return true;
    if (usuario.tipo === "Playero") {
      const opcionesProhibidas = ["Estacionamientos", "Playeros", "Reportes"];
      return !opcionesProhibidas.includes(link.label);
    }
    return true;
  });

  return (
    <div className={cn("rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden", "h-screen")}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-4">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden mt-2 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-4 flex flex-col gap-2">
              {filteredLinks.map((link, idx) => (
                <div key={idx} onClick={link.onClick}><SidebarLink link={link} /></div>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-neutral-800/50 pt-2">
            <SidebarLink
              link={{
                label: usuario ? `${usuario.nombre} ${usuario.apellido}` : "Cargando...",
                href: "/perfil",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full overflow-hidden relative border border-gray-300 dark:border-neutral-600 shadow-sm">
                    {usuario?.avatarUrl ? (
                      <Image src={usuario.avatarUrl} alt="Avatar" fill className="object-cover" sizes="30px" />
                    ) : (
                      <div className="h-full w-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                        {usuario?.nombre?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-900">
         
         {/* LETRERO GLOBAL DE ESTACIONAMIENTO */}
         <AnimatePresence>
           {estacionamientoGlobal && (
             <motion.div 
               initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
               className="h-12 flex-shrink-0 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex items-center justify-end px-4 md:px-10 z-10"
             >
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-neutral-800/80 px-4 py-1.5 rounded-full border border-gray-200 dark:border-neutral-700 shadow-sm">
                  <IconMapPin size={16} className="text-blue-500" />
                  <span>Estacionamiento: <strong className="text-gray-900 dark:text-white">'{estacionamientoGlobal}'</strong></span>
                </div>
             </motion.div>
           )}
         </AnimatePresence>

         {/* Contenido Páginas */}
         <div className="flex-1 w-full overflow-hidden flex flex-col">
            {children}
         </div>
         
      </div>
    </div>
  );
}