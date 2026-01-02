"use client";

import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar"; // Wrapper del Sidebar

import { 
  IconUser, 
  IconPencil, 
  IconDeviceFloppy, 
  IconX, 
  IconAlertTriangle, 
  IconCheck,       
  IconInfoCircle   
} from "@tabler/icons-react";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion"; 

// Servicios y Tipos
import { obtenerPerfil, actualizarPerfil } from "@/services/userService";
import { UsuarioResponse } from "@/types/usuario.types";

export default function PerfilPage() {
  const router = useRouter();

  // Estados de datos
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estado para mensajes (Alertas visuales)
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Estado para el modal de confirmación
  const [showModal, setShowModal] = useState(false);

  // --- CARGA INICIAL ---
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
        setAlerta({ type: 'error', text: "Error al cargar perfil: " + error.message });
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [router]);

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (alerta) setAlerta(null); // Limpiar alerta al escribir
  };

  const handleEditClick = () => { setIsEditing(true); setAlerta(null); };

  const handleCancelClick = () => {
    setIsEditing(false);
    setAlerta(null);
    if(usuario) {
        setFormData({
            dni: usuario.dni,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            password: "",
        });
    }
  };

  // --- PASO 1: VALIDACIÓN (Abre el Modal) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validación DNI
    if (!formData.dni || String(formData.dni).length !== 8) {
        setAlerta({ type: 'error', text: "El DNI es inválido. Debe tener exactamente 8 números." });
        return;
    }
    
    // 2. Validación Campos Vacíos
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
        setAlerta({ type: 'error', text: "El nombre y apellido son obligatorios." });
        return;
    }

    // 3. Validación Solo Letras (Nombre y Apellido)
    const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!soloLetrasRegex.test(formData.nombre) || !soloLetrasRegex.test(formData.apellido)) {
        setAlerta({ type: 'error', text: "El nombre y el apellido solo pueden contener letras." });
        return;
    }

    // Si todo está bien, mostramos el modal
    setShowModal(true);
  };

  // --- PASO 2: CONFIRMACIÓN (Ejecuta el guardado) ---
  const handleConfirmUpdate = async () => {
    setShowModal(false); // Cerrar modal
    setAlerta(null);
    
    try {
      const token = localStorage.getItem("token");
      if(token) {
          await actualizarPerfil(token, formData);
          
          // Mensaje de éxito
          setAlerta({ type: 'success', text: "¡Tus datos se actualizaron correctamente!" });
          setIsEditing(false);
          
          // Actualizar datos en pantalla y localStorage
          const dataActualizada = await obtenerPerfil(token);
          setUsuario(dataActualizada);
          localStorage.setItem("usuario", JSON.stringify(dataActualizada));
      }
    } catch (error: any) {
      setAlerta({ type: 'error', text: error.message || "Ocurrió un error al actualizar." });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-neutral-900 text-white">Cargando perfil...</div>;

  return (
    <AppSidebar>
      <div className="flex-1 w-full h-full overflow-hidden bg-white dark:bg-neutral-900">
        
        <div className="w-full h-full overflow-y-auto p-4 md:p-10 relative bg-white dark:bg-neutral-900">
            
            <div className="max-w-2xl mx-auto mt-4 md:mt-10"> 
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Mi Perfil</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Administra tu información personal.</p>
                    </div>
                    {!isEditing && (
                        <button onClick={handleEditClick} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-neutral-800" title="Editar datos">
                            <IconPencil size={24} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* ALERTAS ANIMADAS */}
                    <AnimatePresence mode="wait">
                        {alerta && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    "p-4 rounded-lg flex items-start gap-3 shadow-sm border",
                                    alerta.type === 'success' 
                                        ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300" 
                                        : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
                                )}
                            >
                                {alerta.type === 'success' ? <IconCheck className="h-5 w-5 mt-0.5" /> : <IconInfoCircle className="h-5 w-5 mt-0.5" />}
                                <div className="flex-1 text-sm font-medium">{alerta.text}</div>
                                <button type="button" onClick={() => setAlerta(null)} className="opacity-50 hover:opacity-100"><IconX size={18} /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* CAMPOS DEL FORMULARIO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">Legajo</label>
                        <input type="text" value={usuario?.legajo || ""} disabled className="w-full rounded-lg border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 shadow-sm p-3" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">DNI</label>
                        <input type="number" name="dni" value={isEditing ? formData.dni : usuario?.dni} onChange={handleChange} disabled={!isEditing} required
                            className={cn("w-full rounded-lg border shadow-sm p-3 transition-colors", isEditing ? "bg-white dark:bg-neutral-900 dark:text-white" : "bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-neutral-700", isEditing && alerta?.type === 'error' && String(formData.dni).length !== 8 ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500")}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">Nombre</label>
                            <input type="text" name="nombre" value={isEditing ? formData.nombre : usuario?.nombre} onChange={handleChange} disabled={!isEditing} required
                                className={cn("w-full rounded-lg border shadow-sm p-3 transition-colors", isEditing ? "border-gray-300 focus:border-blue-500 bg-white dark:bg-neutral-900 dark:text-white" : "border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300")}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">Apellido</label>
                            <input type="text" name="apellido" value={isEditing ? formData.apellido : usuario?.apellido} onChange={handleChange} disabled={!isEditing} required
                                className={cn("w-full rounded-lg border shadow-sm p-3 transition-colors", isEditing ? "border-gray-300 focus:border-blue-500 bg-white dark:bg-neutral-900 dark:text-white" : "border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300")}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">Rol Asignado</label>
                        <div className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 shadow-sm p-3 flex items-center justify-between">
                            <span>{usuario?.tipo || ""}</span>
                            <IconUser size={18} className="text-gray-400" />
                        </div>
                    </div>

                    <AnimatePresence>
                        {isEditing && usuario?.tipo === "Dueño" && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700/30 mt-2">
                                    <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-500 mb-1">Nueva Contraseña</label>
                                    <input type="password" name="password" placeholder="Dejar vacía para no cambiar" value={formData.password} onChange={handleChange} className="w-full rounded-lg border-yellow-400 dark:border-yellow-600/50 bg-white dark:bg-neutral-900 dark:text-white shadow-sm p-3 focus:ring-yellow-500" />
                                    <p className="text-xs text-yellow-600/70 dark:text-yellow-500/70 mt-1">Solo llena esto si deseas cambiar tu clave actual.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isEditing && (
                        <div className="flex flex-col md:flex-row gap-4 pt-4 pb-20">
                            <button type="submit" className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#2563EB_50%,#60A5FA_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-blue-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                                    <IconDeviceFloppy size={25} /> Guardar Cambios
                                </span>
                            </button>
                            <button type="button" onClick={handleCancelClick} className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F87171_0%,#DC2626_50%,#F87171_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-red-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                                    <IconX size={25} /> Cancelar
                                </span>
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
      </div>

      {/* --- MODAL CONFIRMACIÓN --- */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl p-2 bg-yellow-400 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-white dark:bg-black rounded-[14px] w-full h-full p-8 flex flex-col items-center text-center">
                <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
                    <IconAlertTriangle className="h-20 w-20 text-yellow-500 relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">Confirmación</h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-8">¿Está seguro que desea actualizar su información de perfil?</p>
                <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                    {/* Botón Aceptar: Llama a handleConfirmUpdate */}
                    <button type="button" onClick={handleConfirmUpdate} className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 group">
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#2563EB_50%,#60A5FA_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-blue-400 backdrop-blur-3xl group-hover:bg-slate-900 transition-colors">
                            <IconCheck size={25} /> Confirmar
                        </span>
                    </button>
                    {/* Botón Cancelar */}
                    <button type="button" onClick={() => setShowModal(false)} className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50 group">
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F87171_0%,#DC2626_50%,#F87171_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-red-400 backdrop-blur-3xl group-hover:bg-slate-900 transition-colors">
                            <IconX size={25} /> Cancelar
                        </span>
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </AppSidebar>
  );
}