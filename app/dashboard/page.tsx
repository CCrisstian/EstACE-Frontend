"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Importamos el Wrapper del Sidebar
import { AppSidebar } from "@/components/AppSidebar";

// Servicios y Tipos
import { UsuarioResponse } from "@/types/usuario.types";
import { obtenerPerfil } from "@/services/userService";

export default function DashboardPage() {
  // Mantenemos el estado del usuario localmente para mostrar la bienvenida
  const [user, setUser] = useState<UsuarioResponse | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
        try {
            const data = await obtenerPerfil(token);
            setUser(data);
            // Actualizamos localStorage para consistencia
            localStorage.setItem("usuario", JSON.stringify(data));
        } catch (error) {
            console.error("Error obteniendo perfil:", error);
            // Si falla el token (expirado), mandamos al login
            localStorage.removeItem("token");
            router.push("/");
        }
    };

    fetchData();
  }, [router]);

  // Mientras carga el usuario, no mostramos nada
  if (!user) return null;

  return (
    // Envolvemos el contenido específico del Dashboard con el Sidebar reutilizable
    <AppSidebar>
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
            
            <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
                Bienvenido, {user.nombre}
            </h2>
            
            <div className="mt-4 p-4 border border-dashed border-neutral-300 rounded-lg bg-gray-50 dark:bg-neutral-800">
                <h3 className="text-lg font-semibold mb-2 text-neutral-800 dark:text-neutral-200">Tus Datos</h3>
                <div className="space-y-1 text-neutral-800 dark:text-neutral-200">
                    <p><strong>Legajo:</strong> {user.legajo}</p>
                    <p><strong>Rol:</strong> {user.tipo}</p>
                    <p><strong>Nombre completo:</strong> {user.nombre} {user.apellido}</p>
                    <p><strong>DNI:</strong> {user.dni}</p>
                </div>
            </div>            
        </div>
    </AppSidebar>
  );
}