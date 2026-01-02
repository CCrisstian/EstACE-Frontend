"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
} from "@tabler/icons-react";

// Servicios y Tipos
import { obtenerPerfil } from "@/services/userService";
import { UsuarioResponse } from "@/types/usuario.types";

// --- COMPONENTES DE LOGO (Locales) ---
export const Logo = () => (
  <Link
    href="/dashboard"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
  >
    <div className="h-8 w-8 relative overflow-hidden rounded-full flex-shrink-0">
      <Image src="/LogoACE_SinFondo.png" alt="Logo EstACE" fill className="object-cover" />
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
      <Image src="/LogoACE_SinFondo.png" alt="Logo EstACE" fill className="object-cover" />
    </div>
  </Link>
);

// --- COMPONENTE PRINCIPAL ---
export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);

  // Cargar usuario para el avatar y PERMISOS del sidebar
  useEffect(() => {
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
  }, []);

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const handlePending = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Funcionalidad próximamente disponible");
  };

  // Definición de Links (TODOS)
  const links = [
    {
      label: "Ingresos",
      href: "#",
      icon: <IconCar className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: handlePending,
    },
    {
      label: "Estacionamientos",
      href: "/estacionamientos",
      icon: <IconParkingCircle className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Plazas",
      href: "#",
      icon: <IconCarGarage className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: handlePending,
    },
    {
      label: "Tarifas",
      href: "#",
      icon: <IconCashRegister className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: handlePending,
    },
    {
      label: "Métodos de Pago",
      href: "#",
      icon: <IconBusinessplan className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: handlePending,
    },
    {
      label: "Playeros",
      href: "/playeros",
      icon: <IconUsersGroup className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Turnos",
      href: "#",
      icon: <IconHistoryToggle className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: handlePending,
    },
    {
      label: "Abonados",
      href: "#",
      icon: <IconFileInvoice className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: handlePending,
    },
    {
      label: "Reportes",
      href: "#",
      icon: <IconReportAnalytics className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: handlePending,
    },
    {
      label: "Cerrar Sesión",
      href: "#",
      icon: <IconPower className="h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400" />,
      onClick: handleLogout,
    },
  ];

  // --- FILTRADO DE LINKS SEGÚN ROL ---
  const filteredLinks = links.filter((link) => {
    // Si el usuario no ha cargado aún, mostramos todo (o podrías mostrar solo lo básico)
    if (!usuario) return true;

    // Si es PLAYERO, ocultamos las opciones restringidas
    if (usuario.tipo === "Playero") {
      const opcionesProhibidas = ["Estacionamientos", "Playeros", "Reportes"];
      return !opcionesProhibidas.includes(link.label);
    }

    // Si es Dueño, ve todo
    return true;
  });

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen" 
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden mt-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-4 flex flex-col gap-2">
              
              {/* Iteramos sobre filteredLinks en lugar de links */}
              {filteredLinks.map((link, idx) => (
                <div key={idx} onClick={link.onClick}>
                  <SidebarLink link={link} />
                </div>
              ))}

            </div>
          </div>

          {/* Sección de Usuario Inferior */}
          <div>
            <SidebarLink
              link={{
                label: usuario ? `${usuario.nombre} ${usuario.apellido}` : "Cargando...",
                href: "/perfil",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {usuario?.nombre?.charAt(0) || "U"}
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
         {children}
      </div>
    </div>
  );
}