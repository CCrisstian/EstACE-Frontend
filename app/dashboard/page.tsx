"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconPower,
  IconHome,
  IconCar,
  IconHistoryToggle,
  IconUsersGroup,
  IconParkingCircle,
  IconCarGarage,
  IconBusinessplan,
  IconCashRegister,
  IconFileInvoice,
  IconReportAnalytics,
  IconUser,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AuthResponse } from "@/types/auth.types";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("usuario");

    if (!token || !storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/");
  };

  const handlePending = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Función pendiente");
  };

  // Definición de los links del menú
  const links = [
    {
      label: "Ingresos",
      href: "#",
      icon: (
        <IconCar className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: handlePending,
    },
    {
      label: "Estacionamientos",
      href: "#",
      icon: (
        <IconParkingCircle className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: handlePending,
    },
    {
      label: "Plazas",
      href: "#",
      icon: (
        <IconCarGarage className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: handlePending,
    },
    {
      label: "Tarifas",
      href: "#",
      icon: (
        <IconCashRegister className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: handlePending,
    },
    {
      label: "Métodos de Pago",
      href: "#",
      icon: (
        <IconBusinessplan className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: handlePending,
    },
    {
      label: "Playeros",
      href: "#",
      icon: (
        <IconUsersGroup className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: handlePending,
    },
    {
      label: "Turnos",
      href: "#",
      icon: (
        <IconHistoryToggle className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: handlePending,
    },
    {
      label: "Abonados",
      href: "#",
      icon: (
        <IconFileInvoice className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: handlePending,
    },
    {
      label: "Reportes",
      href: "#",
      icon: (
        <IconReportAnalytics className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: handlePending,
    },
    {
      label: "Perfil",
      href: "#",
      icon: (
        <IconUser className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: handlePending,
    },
    {
      label: "Cerrar Sesión",
      href: "#",
      icon: (
        <IconPower className="h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400" />
      ),
      onClick: handleLogout,
    },
  ];

  if (!user) return null; // O un spinner de carga

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden mt-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                // Usamos un div envolvente para capturar el onClick si es necesario
                <div key={idx} onClick={link.onClick}>
                   <SidebarLink link={link} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Sección de Usuario Inferior */}
          <div className="pointer-events-none cursor-default">
            <SidebarLink
              link={{
                label: `${user.nombre} ${user.apellido}`,
                href: "#", // Se mantiene para que el componente no se rompa, pero ya no funcionará
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-xs font-bold text-white">
                    {user.nombre.charAt(0)}
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      
      {/* Contenido Principal del Dashboard */}
      <div className="flex flex-1">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
            <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
                Bienvenido, {user.nombre}
            </h2>
            <div className="mt-4 p-4 border border-dashed border-neutral-300 rounded-lg">
                <div className="mt-4">
                    <p><strong>Legajo:</strong> {user.legajo}</p>
                    <p><strong>Rol:</strong> {user.tipo}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}