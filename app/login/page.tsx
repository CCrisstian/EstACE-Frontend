"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { loginUsuario } from "@/services/authService";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import Link from "next/link"; 
import { useTheme } from "next-themes";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUsuario({ email, password });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data));

      router.push("/dashboard");
    } catch (err) {
      setError("Correo electrónico o contraseña incorrectos.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F5F0] dark:bg-black p-4 transition-colors duration-500">
      
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
              className="focus-visible:ring-[#22c55e] dark:focus-visible:ring-[#3275F8] focus-visible:shadow-[0_0_15px_rgba(34,197,94,0.3)] dark:focus-visible:shadow-[0_0_15px_rgba(50,117,248,0.3)] transition-all duration-300"
            />
          </LabelInputContainer>
          
          <LabelInputContainer className="mb-8">
            <div className="flex justify-between items-center mb-1">
                <Label htmlFor="password" className="mb-0">Contraseña</Label>
                <Link 
                    href="/recuperar-password" 
                    className="text-xs font-medium text-[#22c55e] hover:text-green-600 dark:text-[#3275F8] dark:hover:text-blue-400 transition-colors"
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
                className="pr-10 focus-visible:ring-[#22c55e] dark:focus-visible:ring-[#3275F8] focus-visible:shadow-[0_0_15px_rgba(34,197,94,0.3)] dark:focus-visible:shadow-[0_0_15px_rgba(50,117,248,0.3)] transition-all duration-300" 
              />
              
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-600 dark:text-neutral-400 hover:text-[#22c55e] dark:hover:text-[#3275F8] transition-colors"
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

          {/* 🚨 Aquí usamos nuestro nuevo botón iluminado */}
          <GlowButton type="submit">
            Iniciar Sesión
          </GlowButton>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        </form>
      </HoverBorderGradient>
    </div>
  );
}

// ----------------------------------------------------
// COMPONENTE: Botón con luz interior
// ----------------------------------------------------
const GlowButton = ({ children, ...props }: any) => {
  const radius = 250;
  const [visible, setVisible] = React.useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Color puro para máxima iluminación
  const activeColor = mounted && theme === "light" ? "#22c55e" : "#3275F8";

  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: any) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      style={{
        background: useMotionTemplate`
      radial-gradient(
        ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
        ${activeColor},
        transparent 80%
      )
    `,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      // 🚨 Envoltorio sin fondo sólido
      className="group/btn relative rounded-md p-[1px] transition duration-300"
    >
      <button
        //  En modo claro pasa de bg-black a bg-black/50 para revelar la luz verde interior
        className="relative flex h-10 w-full items-center justify-center rounded-md font-medium text-white transition-all duration-300 bg-black group-hover/btn:bg-black/50 dark:bg-zinc-900 dark:group-hover/btn:bg-zinc-900/50"
        {...props}
      >
        {children}
        <BottomGradient />
      </button>
    </motion.div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-[#22c55e] dark:via-[#3275F8] to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-[#22c55e] dark:via-[#3275F8] to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
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