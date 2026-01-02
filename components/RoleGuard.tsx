"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconAlertOctagon } from "@tabler/icons-react";
import { obtenerPerfil } from "@/services/userService";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[]; // Ej: ["Dueño", "Playero"]
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      // 1. Si no hay token, fuera
      if (!token) {
        router.push("/");
        return;
      }

      try {
        // 2. Obtenemos el perfil para saber el rol real
        const user = await obtenerPerfil(token);

        // 3. Verificamos si el rol está permitido
        if (allowedRoles.includes(user.tipo)) {
          setAuthorized(true);
        } else {
          // Si no tiene permiso, redirigir al dashboard (o a una página 403)
          router.push("/dashboard"); 
        }
      } catch (error) {
        console.error("Error verificando permisos", error);
        router.push("/"); // Ante la duda, al login
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, allowedRoles]);

  // MIENTRAS CARGA: Mostrar spinner para evitar "parpadeos" del contenido prohibido
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-neutral-900">
        <IconLoader2 className="animate-spin h-10 w-10 text-blue-500 mb-2" />
        <p className="text-gray-500">Verificando permisos...</p>
      </div>
    );
  }

  // SI NO ESTÁ AUTORIZADO (aunque el useEffect redirige, esto previene renderizado fugaz)
  if (!authorized) {
    return null; 
  }

  // SI TODO ESTÁ BIEN: Renderizar la página
  return <>{children}</>;
}