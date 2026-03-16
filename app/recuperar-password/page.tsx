"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { solicitarRecuperacion } from "@/services/authService";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { IconMail, IconArrowLeft, IconLoader2, IconCheck } from "@tabler/icons-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await solicitarRecuperacion(email);
      setSuccessMsg(response.message);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-black p-4">
      <HoverBorderGradient
        containerClassName="rounded-2xl p-2"
        as="div" 
        className="bg-white dark:bg-black w-full max-w-md p-4 md:p-8"
      >
        <Link href="/login" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors mb-6">
            <IconArrowLeft size={16} className="mr-1" /> Volver al Login
        </Link>

        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Recuperar Contraseña
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300 mb-8">
          Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        {successMsg ? (
           <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center flex flex-col items-center gap-3">
               <div className="h-12 w-12 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                   <IconCheck size={28} />
               </div>
               <p className="text-sm font-medium text-green-700 dark:text-green-300">{successMsg}</p>
           </div>
        ) : (
            <form className="w-full" onSubmit={handleSubmit}>
                <LabelInputContainer className="mb-8">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <div className="relative">
                        <Input 
                            id="email" 
                            placeholder="ejemplo@correo.com" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10"
                        />
                        <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    </div>
                </LabelInputContainer>

                <button
                    disabled={loading}
                    className="group/btn relative flex items-center justify-center h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-70 disabled:cursor-not-allowed"
                    type="submit"
                >
                    {loading ? <IconLoader2 className="animate-spin h-5 w-5" /> : "Enviar Enlace"}
                    <BottomGradient />
                </button>
            </form>
        )}
      </HoverBorderGradient>
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