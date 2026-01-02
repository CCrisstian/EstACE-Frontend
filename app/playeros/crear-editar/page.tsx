"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { 
  IconUser, IconDeviceFloppy, IconX, IconAlertTriangle, IconCheck, IconInfoCircle, IconLoader2 
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Servicios
import { crearPlayero, editarPlayero, obtenerPlayeroPorId } from "@/services/playeroService";
import { obtenerMisEstacionamientos } from "@/services/estacionamientoService";
import { Estacionamiento } from "@/types/estacionamiento.types";

import RoleGuard from "@/components/RoleGuard";

function CrearEditarPlayeroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idToEdit = searchParams.get("id");

  const [estacionamientos, setEstacionamientos] = useState<Estacionamiento[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    password: "",
    rol: "Playero",
    estacionamientoId: "",
    activo: true
  });

  useEffect(() => {
    const initData = async () => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/"); return; }
  
        try {
          const ests = await obtenerMisEstacionamientos(token);
          setEstacionamientos(ests);
  
          if (idToEdit) {
            setLoadingData(true);
            const data = await obtenerPlayeroPorId(Number(idToEdit), token);
            setForm({
              dni: String(data.dni),
              nombre: data.nombre,
              apellido: data.apellido,
              password: "",
              rol: "Playero",
              estacionamientoId: data.estacionamientoId ? String(data.estacionamientoId) : "",
              activo: data.activo
            });
            setLoadingData(false);
          }
        } catch (error) {
          setAlerta({ type: 'error', text: "Error cargando datos iniciales." });
        }
      };
      initData();
  }, [idToEdit, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      if (alerta) setAlerta(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.dni || !form.nombre || !form.apellido) {
        setAlerta({ type: 'error', text: "Completa los campos obligatorios." });
        return;
      }
      // VALIDACIÓN OBLIGATORIA
      if (!form.estacionamientoId) {
        setAlerta({ type: 'error', text: "Debes asignar un estacionamiento." });
        return;
      }
      setShowModal(true);
    };

  const handleConfirmSave = async () => {
    setShowModal(false);
    setSaving(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload: any = {
        dni: Number(form.dni),
        nombre: form.nombre,
        apellido: form.apellido,
        rol: "Playero", // Siempre enviamos "Playero"
        estacionamientoId: Number(form.estacionamientoId), // Siempre obligatorio
        activo: form.activo,
        password: form.password || undefined
      };

      if (idToEdit) {
        await editarPlayero(Number(idToEdit), payload, token);
        setAlerta({ type: 'success', text: "Playero Actualizado correctamente." });
      } else {
        await crearPlayero(payload, token);
        setAlerta({ type: 'success', text: "Playero Creado correctamente." });
      }

      setTimeout(() => router.push("/playeros"), 2000);

    } catch (error: any) {
      setAlerta({ type: 'error', text: error.message });
      setSaving(false);
    }
  };

  if (loadingData) return <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-900"><IconLoader2 className="animate-spin"/> Cargando...</div>;

  const InputStyle = "w-full rounded-lg border shadow-sm p-3 border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white";
  const LabelStyle = "block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1";

  return (
    <RoleGuard allowedRoles={["Dueño"]}>
    <AppSidebar>
      <div className="flex-1 w-full h-full overflow-hidden bg-white dark:bg-neutral-900">
        <div className="w-full h-full overflow-y-auto p-4 md:p-10">
          <div className="max-w-2xl mx-auto mt-10">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
              {idToEdit ? "Editar Playero" : "Nuevo Playero"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* --- CAMPOS DEL FORMULARIO --- */}
              <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-xl border border-gray-200 dark:border-neutral-700 space-y-6">
                
                {/* FILA 1: DNI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={LabelStyle}>DNI</label>
                    <input type="number" name="dni" value={form.dni} onChange={handleChange} className={InputStyle} />
                  </div>
                </div>

                {/* FILA 2: APELLIDO y NOMBRE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label className={LabelStyle}>Apellido</label>
                    <input type="text" name="apellido" value={form.apellido} onChange={handleChange} className={InputStyle} />
                  </div>
                  
                  <div>
                    <label className={LabelStyle}>Nombre</label>
                    <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className={InputStyle} />
                  </div>
                </div>

                  {/* SELECTOR DE ESTACIONAMIENTO */}
                  <div>
                    <label className={LabelStyle}>Asignar a Estacionamiento</label>
                    <select name="estacionamientoId" value={form.estacionamientoId} onChange={handleChange} className={InputStyle}>
                      <option value="">-- Seleccionar --</option>
                      {estacionamientos.map(est => (
                        <option key={est.id} value={est.id}>{est.nombre}</option>
                      ))}
                    </select>
                  </div>

                <div>
                  <label className={LabelStyle}>Contraseña {idToEdit && "(Dejar vacía para no cambiar)"}</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} className={InputStyle} />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      name="activo" 
                      checked={form.activo} 
                      onChange={handleChange} 
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 checked:bg-green-600 checked:border-green-600 transition-all" 
                    />
                    <IconCheck size={14} className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                  </div>
                  
                  <label 
                    onClick={() => setForm(prev => ({...prev, activo: !prev.activo}))}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                  >
                    Activo
                  </label>
                </div>

              </div>

              <div className="mt-8 space-y-6">
                
                {/* BOTONES */}
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    {/* Botón GUARDAR (Azul) */}
                    <button 
                        type="submit"
                        disabled={saving}
                        className="relative inline-flex h-12 w-full md:w-auto overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#2563EB_50%,#60A5FA_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-blue-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                            {saving ? <IconLoader2 className="animate-spin" size={20} /> : <IconDeviceFloppy size={20} />} 
                            {idToEdit ? "Actualizar" : "Guardar"}
                        </span>
                    </button>

                    {/* Botón CANCELAR (Rojo) */}
                    <button 
                        type="button" 
                        onClick={() => router.push("/playeros")} 
                        className="relative inline-flex h-12 w-full md:w-auto overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                    >
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F87171_0%,#DC2626_50%,#F87171_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-red-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                            <IconX size={20} /> Cancelar
                        </span>
                    </button>
                </div>

                {/* ALERTAS CON ANIMACIÓN Y ESTILOS DE COLOR */}
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
                            {alerta.type === 'success' ? (
                                <IconCheck className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            ) : (
                                <IconInfoCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 text-sm font-medium">{alerta.text}</div>
                            
                            <button type="button" onClick={() => setAlerta(null)} className="opacity-50 hover:opacity-100">
                                <IconX size={18} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

              </div>

            </form>
          </div>
        </div>
      </div>

      {/* --- MODAL DE CONFIRMACIÓN --- */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl p-2 bg-yellow-400 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-white dark:bg-black rounded-[14px] w-full h-full p-8 flex flex-col items-center text-center">
                
                {/* ÍCONO CON EFECTO GLOW */}
                <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
                    <IconAlertTriangle className="h-20 w-20 text-yellow-500 relative z-10" />
                </div>

                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                    Confirmar {idToEdit ? "Edición" : "Creación"}
                </h2>
                
                <p className="text-neutral-600 dark:text-neutral-300 mb-8">
                    ¿Estás seguro que deseas {idToEdit ? "actualizar los datos de" : "registrar"} este Playero?
                </p>

                <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                    
                    {/* BOTÓN ACEPTAR */}
                    <button 
                        type="button" 
                        onClick={handleConfirmSave}
                        className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 group"
                    >
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#2563EB_50%,#60A5FA_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-blue-400 backdrop-blur-3xl group-hover:bg-slate-900 transition-colors">
                            <IconCheck size={25} /> Confirmar
                        </span>
                    </button>

                    {/* BOTÓN CANCELAR */}
                    <button 
                        type="button" 
                        onClick={() => setShowModal(false)} 
                        className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50 group"
                    >
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
    </RoleGuard>
  );
}

export default function Page() {
  return <Suspense fallback={<div>Cargando...</div>}><CrearEditarPlayeroContent /></Suspense>;
}