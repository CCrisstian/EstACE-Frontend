"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthResponse } from "@/types/auth.types";

export default function DashboardPage() {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificamos si hay token guardado
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("usuario");

    if (!token || !storedUser) {
      router.push("/login"); // Si no hay token, fuera de aquí
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/");
  };

  if (!user) return <p className="p-10">Cargando...</p>;

  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-bold mb-4">¡Bienvenido, {user.nombre}!</h1>
      <p className="text-xl mb-8">Has ingresado correctamente al sistema.</p>
      
      <div className="border border-black p-4 inline-block text-left mb-8">
        <p><strong>Legajo:</strong> {user.legajo}</p>
        <p><strong>DNI:</strong> {user.dni}</p>
        <p><strong>Rol:</strong> {user.tipo}</p>
      </div>
      <br />

      <button 
        onClick={handleLogout}
        className="border-2 border-black px-6 py-2 hover:bg-red-600 hover:text-white hover:border-red-600 transition"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}