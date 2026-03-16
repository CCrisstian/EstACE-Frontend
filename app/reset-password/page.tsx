"use client";

import React, { useState, Suspense } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { restablecerPassword } from "@/services/authService";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { IconEye, IconEyeOff, IconLoader2, IconCheck, IconLock } from "@tabler/icons-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!token) {
        setError("Enlace de recuperación inválido o faltante.");
        return;
    }

    if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
    }

    if (password.length < 4) {
        setError("La contraseña debe ser más larga.");
        return;
    }

    setLoading(true);

    try {
      const response = await restablecerPassword(token, password);
      setSuccessMsg(response.message);
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
          router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "El enlace ha expirado o es inválido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <HoverBorderGradient containerClassName="rounded-2xl p-2" as="div" className="bg-white dark:bg-black w-full max-w-md p-4 md:p-8">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Crear Nueva Contraseña</h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300 mb-8">
        Ingresa tu nueva contraseña para acceder a tu cuenta.
      </p>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      {successMsg ? (
         <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center flex flex-col items-center gap-3">
             <div className="h-12 w-12 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                 <IconCheck size={28} />
             </div>
             <p className="text-sm font-medium text-green-700 dark:text-green-300">{successMsg}</p>
             <p className="text-xs text-neutral-500 mt-2">Redirigiendo al inicio de sesión...</p>
         </div>
      ) : (
        <form className="w-full" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="password" placeholder="••••••••"
                type={isVisible ? "text" : "password"} 
                value={password} onChange={(e) => setPassword(e.target.value)}
                required className="pr-10 pl-10" 
              />
              <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                type="button" onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
              </button>
            </div>
          </LabelInputContainer>

          <LabelInputContainer className="mb-8">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword" placeholder="••••••••"
                type={isVisible ? "text" : "password"} 
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                required className="pr-10 pl-10" 
              />
              <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            </div>
          </LabelInputContainer>

          <button
            disabled={loading}
            className="group/btn relative flex items-center justify-center h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-70 disabled:cursor-not-allowed"
            type="submit"
          >
            {loading ? <IconLoader2 className="animate-spin h-5 w-5" /> : "Guardar Contraseña"}
            <BottomGradient />
          </button>
          
          <div className="mt-6 text-center">
              <Link href="/login" className="text-sm font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors">
                  Cancelar y volver
              </Link>
          </div>
        </form>
      )}
    </HoverBorderGradient>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-black p-4">
      <Suspense fallback={<div>Cargando...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string; }) => (
  <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>
);