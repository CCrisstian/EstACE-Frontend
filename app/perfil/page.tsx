"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
// Iconos
import { User, Pencil, Save, X } from "lucide-react";
import { IconChevronLeft, IconPower } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// Servicios y Tipos
import { obtenerPerfil, actualizarPerfil } from "@/services/userService";
import { UsuarioResponse } from "@/types/usuario.types";

export default function PerfilPage() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
           router.push("/");
           return; 
        }
        const data = await obtenerPerfil(token);
        setUsuario(data);
        setFormData({
          dni: data.dni,
          nombre: data.nombre,
          apellido: data.apellido,
          password: "",
        });
        localStorage.setItem("usuario", JSON.stringify(data));
      } catch (error: any) {
        setMensaje("Error: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = () => { setIsEditing(true); setMensaje(""); };

  const handleCancelClick = () => {
    setIsEditing(false);
    if(usuario) {
        setFormData({
            dni: usuario.dni,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            password: "",
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (String(formData.dni).length !== 8) {
        setMensaje("El DNI debe tener 8 números.");
        return;
    }
    try {
      const token = localStorage.getItem("token");
      if(token) {
          await actualizarPerfil(token, formData);
          setMensaje("¡Datos actualizados con éxito!");
          setIsEditing(false);
          const dataActualizada = await obtenerPerfil(token);
          setUsuario(dataActualizada);
          localStorage.setItem("usuario", JSON.stringify(dataActualizada));
      }
    } catch (error: any) {
      setMensaje(error.message);
    }
  };

  const links = [
    { label: "Volver al Inicio", href: "/dashboard", icon: <IconChevronLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Cerrar Sesión", href: "#", icon: <IconPower className="h-5 w-5 text-red-500 dark:text-red-400" />, onClick: handleLogout },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center bg-neutral-900 text-white">Cargando perfil...</div>;

  return (
    <div className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-900 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}>
      
      {/* --- SIDEBAR --- */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden mt-2">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-4 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div key={idx} onClick={link.onClick}>
                   <SidebarLink link={link} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: usuario ? `${usuario.nombre} ${usuario.apellido}` : "Usuario",
                href: "/perfil",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {usuario?.nombre.charAt(0)}
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* --- CONTENIDO PRINCIPAL (PANTALLA ÚNICA) --- */}
      <div className="flex-1 w-full h-full overflow-hidden bg-white dark:bg-neutral-900">
        
        {/* Formulario Centrado */}
        <div className="w-full h-full overflow-y-auto p-4 md:p-10 relative bg-white dark:bg-neutral-900">
            
            <div className="max-w-2xl mx-auto mt-4 md:mt-10"> {/* Añadido margen superior para que no pegue al techo */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Mi Perfil</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Administra tu información personal.</p>
                    </div>
                    {!isEditing && (
                        <button onClick={handleEditClick} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-neutral-800" title="Editar datos">
                            <Pencil size={24} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* LEGAJO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">Legajo</label>
                        <input type="text" value={usuario?.legajo || ""} disabled
                            className="w-full rounded-lg border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 shadow-sm p-3"
                        />
                    </div>

                    {/* DNI */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">DNI</label>
                        <input type="number" name="dni"
                            value={isEditing ? formData.dni : usuario?.dni}
                            onChange={handleChange} disabled={!isEditing} required
                            className={`w-full rounded-lg border shadow-sm p-3 transition-colors
                                ${isEditing 
                                    ? "border-blue-500 bg-white dark:bg-neutral-900 dark:text-white dark:border-blue-500 ring-2 ring-blue-500/20" 
                                    : "border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300"}`}
                        />
                    </div>

                    {/* NOMBRE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">Nombre</label>
                        <input type="text" name="nombre"
                            value={isEditing ? formData.nombre : usuario?.nombre}
                            onChange={handleChange} disabled={!isEditing} required
                            className={`w-full rounded-lg border shadow-sm p-3 transition-colors
                                ${isEditing 
                                    ? "border-blue-500 bg-white dark:bg-neutral-900 dark:text-white dark:border-blue-500 ring-2 ring-blue-500/20" 
                                    : "border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300"}`}
                        />
                    </div>

                    {/* APELLIDO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">Apellido</label>
                        <input type="text" name="apellido"
                            value={isEditing ? formData.apellido : usuario?.apellido}
                            onChange={handleChange} disabled={!isEditing} required
                            className={`w-full rounded-lg border shadow-sm p-3 transition-colors
                                ${isEditing 
                                    ? "border-blue-500 bg-white dark:bg-neutral-900 dark:text-white dark:border-blue-500 ring-2 ring-blue-500/20" 
                                    : "border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300"}`}
                        />
                    </div>

                    {/* ROL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">Rol Asignado</label>
                        <div className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 shadow-sm p-3 flex items-center justify-between">
                            <span>{usuario?.tipo || ""}</span>
                            <User size={18} className="text-gray-400" />
                        </div>
                    </div>

                    {/* PASSWORD (Solo Dueño y Editando) */}
                    {isEditing && usuario?.tipo === "Dueño" && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700/30 mt-6">
                            <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-500 mb-1">Nueva Contraseña</label>
                            <input type="password" name="password" placeholder="Dejar vacía para no cambiar"
                                value={formData.password} onChange={handleChange}
                                className="w-full rounded-lg border-yellow-400 dark:border-yellow-600/50 bg-white dark:bg-neutral-900 dark:text-white shadow-sm p-3 focus:ring-yellow-500"
                            />
                        </div>
                    )}

                    {/* MENSAJES */}
                    {mensaje && (
                        <div className={`p-4 rounded-lg text-sm font-medium ${mensaje.includes("éxito") ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                            {mensaje}
                        </div>
                    )}

                    {/* BOTONES CON ESTILO ACETERNITY */}
                    {isEditing && (
                        <div className="flex flex-col md:flex-row gap-4 pt-4 pb-20">
                            
                            {/* BOTÓN GUARDAR (AZUL) */}
                            <button 
                                type="submit" 
                                className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                            >
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#2563EB_50%,#60A5FA_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-blue-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                                    <Save size={25} /> Guardar Cambios
                                </span>
                            </button>

                            {/* BOTÓN CANCELAR (ROJO) */}
                            <button 
                                type="button" 
                                onClick={handleCancelClick} 
                                className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                            >
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F87171_0%,#DC2626_50%,#F87171_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-red-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                                    <X size={25} /> Cancelar
                                </span>
                            </button>
                            
                        </div>
                    )}
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}

// Componentes de Logo (Igual que en Dashboard)
export const Logo = () => {
  return (
    <Link href="/dashboard" className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <div className="h-8 w-8 relative overflow-hidden rounded-full flex-shrink-0">
        <Image src="/LogoACE_SinFondo.png" alt="Logo EstACE" fill className="object-cover" sizes="32px" />
      </div>
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium text-black dark:text-white whitespace-pre">
        EstACE V2
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link href="/dashboard" className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <div className="h-8 w-8 relative overflow-hidden rounded-full flex-shrink-0">
        <Image src="/LogoACE_SinFondo.png" alt="Logo EstACE" fill className="object-cover" sizes="32px" />
      </div>
    </Link>
  );
};