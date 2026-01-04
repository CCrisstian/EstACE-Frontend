"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar"; 
import AvatarUpload from "@/components/AvatarUpload"; 
import { supabase } from "@/lib/supabase"; 

// Iconos
import { 
  IconUser, 
  IconPencil, 
  IconDeviceFloppy, 
  IconX, 
  IconAlertTriangle, 
  IconCheck,       
  IconInfoCircle,
  IconTrash   
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion"; 

// Servicios y Tipos
import { obtenerPerfil, actualizarPerfil } from "@/services/userService";
import { UsuarioResponse } from "@/types/usuario.types";

export default function PerfilPage() {
  const router = useRouter();
  
  // --- ESTADOS ---
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Alertas
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Modal y Acción (Guardar o Borrar)
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'save_profile' | 'delete_avatar' | null>(null);

  // Helper para alertas
  const handleShowAlert = (type: 'success' | 'error', text: string) => {
    setAlerta({ type, text });
    // Auto-ocultar a los 5 segundos
    setTimeout(() => setAlerta(null), 5000);
  };

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/"); return; }
        
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
        handleShowAlert('error', "Error al cargar perfil: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [router]);

// --- HANDLERS ---
  const handleAvatarUpdate = (newUrl: string | null) => {
    if (usuario) {
        const updatedUser = { ...usuario, avatarUrl: newUrl } as UsuarioResponse; 
        setUsuario(updatedUser);
        localStorage.setItem("usuario", JSON.stringify(updatedUser)); 
        
        // CONDICIÓN: Solo recargar si newUrl es NULL (significa que se eliminó)
        if (newUrl === null) {
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (alerta) setAlerta(null); 
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

  // --- ACCIONES DEL FORMULARIO (ABREN MODAL) ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dni || String(formData.dni).length !== 8) return handleShowAlert('error', "El DNI es inválido (8 números).");
    if (!formData.nombre.trim() || !formData.apellido.trim()) return handleShowAlert('error', "Nombre y apellido son obligatorios.");
    const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!soloLetrasRegex.test(formData.nombre) || !soloLetrasRegex.test(formData.apellido)) return handleShowAlert('error', "Solo letras en nombre/apellido.");

    setModalAction('save_profile');
    setShowModal(true);
  };

  const handleRequestDeleteAvatar = () => {
    setModalAction('delete_avatar');
    setShowModal(true);
  };

  // --- EJECUCIÓN (CONFIRMACIÓN MODAL) ---
  const handleConfirmAction = async () => {
    setShowModal(false);
    setAlerta(null);
    const token = localStorage.getItem("token");
    if(!token) return;

    try {
        if (modalAction === 'save_profile') {
            await actualizarPerfil(token, formData);
            handleShowAlert('success', "¡Tus datos se actualizaron correctamente!");
            setIsEditing(false);
            const dataActualizada = await obtenerPerfil(token);
            setUsuario(dataActualizada);
            localStorage.setItem("usuario", JSON.stringify(dataActualizada));

        } else if (modalAction === 'delete_avatar') {
            if (usuario?.avatarUrl) {
                // 1. Borrar de Supabase
                const fileName = usuario.avatarUrl.split('/').pop();
                if (fileName) await supabase.storage.from('avatars').remove([fileName]);
                
                // 2. Borrar de Backend
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${usuario.legajo}/avatar`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ avatarUrl: null })
                });
                if (!res.ok) throw new Error("Error al eliminar foto.");

                handleAvatarUpdate(null);
                handleShowAlert('success', "Foto de perfil eliminada.");
            }
        }
    } catch (error: any) {
        handleShowAlert('error', error.message || "Ocurrió un error.");
    } finally {
        setModalAction(null);
    }
  };

  // Configuración dinámica del contenido del modal según la acción
  const getModalContent = () => {
    if (modalAction === 'delete_avatar') {
        return {
            title: "Eliminar Foto",
            text: "¿Estás seguro que deseas eliminar tu foto de perfil? Esta acción no se puede deshacer.",
            icon: <IconTrash className="h-20 w-20 text-yellow-500 relative z-10" />,
            glowColor: "bg-yellow-500/20",
            btnText: "Eliminar",
            btnGradient: "bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#2563EB_50%,#60A5FA_100%)]",
            btnTextColor: "text-blue-400"
        };
    }
    return {
        title: "Confirmar Cambios",
        text: "¿Estás seguro que deseas actualizar tu información de perfil?",
        icon: <IconAlertTriangle className="h-20 w-20 text-yellow-500 relative z-10" />,
        glowColor: "bg-yellow-500/20",
        btnText: "Confirmar",
        btnGradient: "bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#2563EB_50%,#60A5FA_100%)]",
        btnTextColor: "text-blue-400"
    };
  };
  const modalContent = getModalContent();

  if (loading) return <div className="h-screen flex items-center justify-center bg-neutral-900 text-white">Cargando perfil...</div>;

  return (
    <AppSidebar>
      <div className="flex-1 w-full h-full overflow-hidden bg-white dark:bg-neutral-900">
        
        <div className="w-full h-full overflow-y-auto p-4 md:p-10 relative bg-white dark:bg-neutral-900">
            
            <div className="max-w-5xl mx-auto mt-4 md:mt-10"> 
                
                {/* Encabezado */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Mi Perfil</h2>
                        {!isEditing && (
                            <button 
                                onClick={handleEditClick} 
                                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-neutral-800" 
                                title="Editar datos"
                            >
                                <IconPencil size={22} />
                            </button>
                        )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Administra tu información personal.</p>
                </div>

                {/* GRID LAYOUT (Formulario Izquierda / Foto Derecha) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
                    
                    {/* COLUMNA 1: FORMULARIO */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        
                        {/* --- ALERTAS VISUALES --- */}
                        <AnimatePresence mode="wait">
                            {alerta && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className={cn(
                                        "p-4 rounded-lg flex items-start gap-3 shadow-sm border mb-6",
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
        
                        <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
                            {/* Legajo y DNI*/}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">Legajo</label>
                                    <input 
                                        type="text" 
                                        value={usuario?.legajo || ""} 
                                        disabled 
                                        className="w-full rounded-lg border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 shadow-sm p-2.5 text-sm" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">DNI</label>
                                    <input 
                                        type="number" 
                                        name="dni" 
                                        value={isEditing ? formData.dni : usuario?.dni} 
                                        onChange={handleChange} 
                                        disabled={!isEditing} 
                                        required
                                        className={cn(
                                            "w-full rounded-lg border shadow-sm p-2.5 text-sm transition-colors", 
                                            isEditing 
                                                ? "bg-white dark:bg-neutral-900 dark:text-white" 
                                                : "bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-neutral-700", 
                                            isEditing && alerta?.type === 'error' && String(formData.dni).length !== 8 
                                                ? "border-red-500 focus:ring-red-500" 
                                                : "border-gray-300 focus:border-blue-500"
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Nombre y Apellido */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">Nombre</label>
                                    <input 
                                        type="text" 
                                        name="nombre" 
                                        value={isEditing ? formData.nombre : usuario?.nombre} 
                                        onChange={handleChange} 
                                        disabled={!isEditing} 
                                        required
                                        className={cn(
                                            "w-full rounded-lg border shadow-sm p-2.5 text-sm transition-colors", 
                                            isEditing 
                                                ? "border-gray-300 focus:border-blue-500 bg-white dark:bg-neutral-900 dark:text-white" 
                                                : "border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300"
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">Apellido</label>
                                    <input 
                                        type="text" 
                                        name="apellido" 
                                        value={isEditing ? formData.apellido : usuario?.apellido} 
                                        onChange={handleChange} 
                                        disabled={!isEditing} 
                                        required
                                        className={cn(
                                            "w-full rounded-lg border shadow-sm p-2.5 text-sm transition-colors", 
                                            isEditing 
                                                ? "border-gray-300 focus:border-blue-500 bg-white dark:bg-neutral-900 dark:text-white" 
                                                : "border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300"
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Rol */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">Rol Asignado</label>
                                    <div className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 shadow-sm p-2.5 text-sm flex items-center justify-between">
                                        <span>{usuario?.tipo || ""}</span>
                                        <IconUser size={18} className="text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {isEditing && usuario?.tipo === "Dueño" && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700/30 mt-2">
                                            <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-500 mb-1">Nueva Contraseña</label>
                                            <input type="password" name="password" placeholder="Dejar vacía para no cambiar" value={formData.password} onChange={handleChange} className="w-full rounded-lg border-yellow-400 dark:border-yellow-600/50 bg-white dark:bg-neutral-900 dark:text-white shadow-sm p-2.5 text-sm focus:ring-yellow-500" />
                                            <p className="text-xs text-yellow-600/70 dark:text-yellow-500/70 mt-1">Solo llena esto si deseas cambiar tu clave actual.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {isEditing && (
                                <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-20">
                                    <button type="submit" className="relative inline-flex h-12 w-full sm:w-auto overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#2563EB_50%,#60A5FA_100%)]" />
                                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-blue-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                                            <IconDeviceFloppy size={20} /> Guardar
                                        </span>
                                    </button>
                                    <button type="button" onClick={handleCancelClick} className="relative inline-flex h-12 w-full sm:w-auto overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F87171_0%,#DC2626_50%,#F87171_100%)]" />
                                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-red-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                                            <IconX size={20} /> Cancelar
                                        </span>
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* COLUMNA 2: FOTO DE PERFIL */}
                    <div className="lg:col-span-1 order-1 lg:order-2 flex flex-col items-center justify-center w-full">
                        <div className="bg-white dark:bg-neutral-800/30 p-8 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 flex flex-col items-center gap-6 w-full max-w-sm">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Foto de Perfil</h3>
                            </div>
                            
                            {usuario && (
                                <AvatarUpload 
                                    usuarioLegajo={Number(usuario.legajo)} 
                                    currentAvatarUrl={usuario.avatarUrl ?? undefined} 
                                    onAvatarUpdate={handleAvatarUpdate}
                                    onShowAlert={handleShowAlert}
                                    onRequestDelete={handleRequestDeleteAvatar}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- MODAL DE CONFIRMACIÓN --- */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl p-2 bg-yellow-400 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-white dark:bg-black rounded-[14px] w-full h-full p-8 flex flex-col items-center text-center">
                
                <div className="mb-6 relative">
                    <div className={cn("absolute inset-0 blur-xl rounded-full", modalContent.glowColor)}></div>
                    {modalContent.icon}
                </div>

                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">{modalContent.title}</h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-8">{modalContent.text}</p>

                <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                    
                    {/* BOTÓN CONFIRMAR */}
                    <button type="button" onClick={handleConfirmAction} className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 group">
                        <span className={cn("absolute inset-[-1000%] animate-[spin_2s_linear_infinite]", modalContent.btnGradient)} />
                        <span className={cn("inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium backdrop-blur-3xl group-hover:bg-slate-900 transition-colors", modalContent.btnTextColor)}>
                            {modalAction === 'delete_avatar' ? <IconTrash size={25} /> : <IconCheck size={25} />} 
                            {modalContent.btnText}
                        </span>
                    </button>

                    {/* BOTÓN CANCELAR */}
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