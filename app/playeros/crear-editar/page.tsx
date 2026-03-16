"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import Image from "next/image";
import { 
  IconUser, IconDeviceFloppy, IconX, IconAlertTriangle, IconCheck, IconInfoCircle, IconLoader2, IconCamera, IconUpload
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Servicios
import { crearPlayero, editarPlayero, obtenerPlayeroPorId } from "@/services/playeroService";
import { obtenerEstacionamientosActivos } from "@/services/estacionamientoService";
import { Estacionamiento } from "@/types/estacionamiento.types";
import { supabase } from "@/lib/supabase";

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

  // --- ESTADOS PARA LA FOTO DE PERFIL ---
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    email: "",       
    telefono: "",    
    direccion: "",   
    password: "",
    rol: "Playero",
    estacionamientoId: "",
    activo: true,
    avatarUrl: ""
  });

  useEffect(() => {
    const initData = async () => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/"); return; }
  
        try {
          const ests = await obtenerEstacionamientosActivos(token);
          setEstacionamientos(ests);
  
          if (idToEdit) {
            setLoadingData(true);
            const data = await obtenerPlayeroPorId(Number(idToEdit), token);
            setForm({
              dni: String(data.dni),
              nombre: data.nombre,
              apellido: data.apellido,
              email: data.email || "",             
              telefono: data.telefono || "",       
              direccion: data.direccion || "",     
              password: "",
              rol: "Playero",
              estacionamientoId: data.estacionamientoId ? String(data.estacionamientoId) : "",
              activo: data.activo,
              avatarUrl: data.avatarUrl || ""
            });
            if (data.avatarUrl) {
                setPreviewUrl(data.avatarUrl);
            }
            setLoadingData(false);
          } else {
              const globalEstId = localStorage.getItem("selectedEstId");
              if (globalEstId) {
                  setForm(prev => ({ ...prev, estacionamientoId: globalEstId })); 
              }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!form.dni || !form.nombre || !form.apellido) {
        setAlerta({ type: 'error', text: "Completa los campos obligatorios." });
        return;
      }

      // Validar contraseña solo en caso de CREAR un nuevo playero
      if (!idToEdit && !form.password.trim()) {
        setAlerta({ type: 'error', text: "La contraseña es obligatoria para nuevos playeros." });
        return;
      }

      if (!form.email.trim() || !form.email.includes("@")) {
        setAlerta({ type: 'error', text: "Ingresa un correo electrónico válido." });
        return;
      }
      
      if (!form.telefono.trim()) {
        setAlerta({ type: 'error', text: "El teléfono es obligatorio." });
        return;
      }

      // Validación estricta de Teléfono Argentino (Fijos y Celulares)
      const telefonoRegex = /^(?:(?:00|\+)?54\s?9?\s?)?(?:11|[234678]\d{2,3})[\s-]?\d{6,8}$/;
      if (!telefonoRegex.test(form.telefono)) {
        setAlerta({ 
            type: 'error', 
            text: "Teléfono inválido. Usa un formato válido como +54 9 11 1234-5678 o código de área y número." 
        });
        return;
      }

      if (!form.direccion.trim()) {
        setAlerta({ type: 'error', text: "La dirección es obligatoria." });
        return;
      }

      if (!form.estacionamientoId) {
        setAlerta({ type: 'error', text: "Debes asignar un estacionamiento." });
        return;
      }
      
      setShowModal(true);
    };

  const uploadAvatarToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_playero_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error subiendo foto:', error);
      throw new Error("No se pudo subir la foto de perfil.");
    }
  };

  const handleConfirmSave = async () => {
    setShowModal(false);
    setSaving(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      let finalAvatarUrl = form.avatarUrl;

      if (selectedFile) {
        const uploadedUrl = await uploadAvatarToSupabase(selectedFile);
        if (uploadedUrl) {
            finalAvatarUrl = uploadedUrl;
        }
      }

      const payload: any = {
        dni: Number(form.dni),
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,            
        telefono: form.telefono,      
        direccion: form.direccion,    
        rol: "Playero",
        estacionamientoId: Number(form.estacionamientoId),
        activo: form.activo,
        password: form.password || undefined,
        avatarUrl: finalAvatarUrl
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
      <div className="flex-1 w-full h-full overflow-y-auto p-4 md:px-10 md:py-6 bg-white dark:bg-neutral-900">
          
          <div className="max-w-2xl mx-auto mt-2">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
              {idToEdit ? "Editar Playero" : "Nuevo Playero"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-xl border border-gray-200 dark:border-neutral-700 space-y-8"> 
                
                {/* --- SECCIÓN FOTO DE PERFIL --- */}
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6 border-b border-gray-200 dark:border-neutral-700">
                  <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                    <div className="w-28 h-28 md:w-42 md:h-42 rounded-full overflow-hidden border-4 border-white dark:border-neutral-800 shadow-lg relative bg-gray-100 dark:bg-neutral-700 flex items-center justify-center">
                      {previewUrl ? (
                        <Image src={previewUrl} alt="Avatar" fill className="object-cover" sizes="128px" />
                      ) : (
                        <IconUser className="w-16 h-16 text-gray-400 dark:text-neutral-500" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <IconCamera className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">Cambiar</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Foto de perfil</h3>
                    <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
                      Tamaño recomendado de imagen: 256x256px.
                    </p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    {selectedFile && (
                      <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex justify-center sm:justify-start items-center gap-1">
                        <IconCheck size={14} /> Foto de perfil cargada.
                      </p>
                    )}
                  </div>
                </div>
                
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

                {/* FILA 3 - EMAIL Y TELÉFONO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label className={LabelStyle}>Correo Electrónico</label>
                    <input type="email" name="email" placeholder="ejemplo@correo.com" value={form.email} onChange={handleChange} className={InputStyle} />
                  </div>
                  <div>
                    <label className={LabelStyle}>Teléfono</label>
                    <input type="text" name="telefono" placeholder="+54 370 4123456" value={form.telefono} onChange={handleChange} className={InputStyle} />
                  </div>
                </div>

                {/* FILA 4 - DIRECCIÓN */}
                <div>
                  <label className={LabelStyle}>Dirección Completa</label>
                  <input type="text" name="direccion" placeholder="Calle, Número, Localidad..." value={form.direccion} onChange={handleChange} className={InputStyle} />
                </div>

                {/* SELECTOR DE ESTACIONAMIENTO */}
                <div>
                  <label className={LabelStyle}>Asignar a Estacionamiento</label>
                  <select 
                    name="estacionamientoId" 
                    value={form.estacionamientoId} 
                    onChange={handleChange} 
                    className={InputStyle}
                    disabled={!!idToEdit || (typeof window !== "undefined" && !!localStorage.getItem("selectedEstId"))}
                  >
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
                    {/* Botón GUARDAR */}
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

                    {/* Botón CANCELAR */}
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

                {/* ALERTAS */}
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

      {/* --- MODAL DE CONFIRMACIÓN --- */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl p-2 bg-yellow-400 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-white dark:bg-black rounded-[14px] w-full h-full p-8 flex flex-col items-center text-center">
                
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