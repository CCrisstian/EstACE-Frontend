"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { loginUsuario } from "@/services/authService";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import Link from "next/link"; // Importamos Link

export default function LoginPage() {
  const [email, setEmail] = useState(""); // <-- Cambiado a email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      // Enviamos el email a la API
      const data = await loginUsuario({ email, password });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data));

      router.push("/dashboard");
    } catch (err) {
      setError("Correo electrónico o contraseña incorrectos.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-black p-4">
      
      <HoverBorderGradient
        containerClassName="rounded-2xl p-2"
        as="div" 
        className="bg-white dark:bg-black w-full max-w-md p-4 md:p-8"
      >
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Bienvenido a A.C.E. V2.0
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Ingresa tu correo y contraseña para acceder al sistema.
        </p>

        {error && (
          <p className="mt-4 text-center text-sm font-medium text-red-500">
            {error}
          </p>
        )}

        <form className="my-8 w-full" onSubmit={handleSubmit}>
          
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input 
              id="email" 
              placeholder="ejemplo@correo.com" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </LabelInputContainer>
          
          <LabelInputContainer className="mb-8">
            {/* Flex container para poner el label y el link de recuperar contraseña en la misma línea */}
            <div className="flex justify-between items-center mb-1">
                <Label htmlFor="password" className="mb-0">Contraseña</Label>
                <Link 
                    href="/recuperar-password" 
                    className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>
            
            <div className="relative">
              <Input
                id="password"
                placeholder="••••••••"
                type={isVisible ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10" 
              />
              
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                type="button" 
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? (
                  <IconEyeOff className="h-5 w-5" />
                ) : (
                  <IconEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
          >
            Iniciar Sesión
            <BottomGradient />
          </button>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        </form>
      </HoverBorderGradient>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};