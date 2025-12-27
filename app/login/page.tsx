"use client"; // Obligatorio para usar hooks como useState

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUsuario } from "@/services/authService";

export default function LoginPage() {
  const [legajo, setLegajo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Llamamos al servicio
      const data = await loginUsuario({ legajo: Number(legajo), password });
      
      // 2. Guardamos el token en el navegador (LocalStorage)
      // OJO: En una app real avanzada usaríamos Cookies, pero esto sirve para empezar.
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data));

      // 3. Redirigimos al dashboard
      router.push("/dashboard");
      
    } catch (err) {
      setError("Legajo o contraseña incorrectos.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Iniciar Sesión</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-64 border-2 border-black p-6">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        
        <input
          type="number"
          placeholder="Legajo"
          className="border border-black p-2"
          value={legajo}
          onChange={(e) => setLegajo(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Contraseña"
          className="border border-black p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" className="bg-black text-white p-2 hover:bg-gray-800">
          Entrar
        </button>
      </form>
    </div>
  );
}