"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AppSidebar } from "@/components/AppSidebar";
import { 
  IconCarGarage, IconDeviceFloppy, IconX, IconAlertTriangle, IconCheck, IconInfoCircle, IconLoader2, IconLayersDifference 
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { obtenerEstacionamientosActivos } from "@/services/estacionamientoService";
import { crearPlaza, editarPlaza, obtenerPlazaPorId, obtenerCategorias, crearPlazasEnLote } from "@/services/plazaService";
import { Estacionamiento } from "@/types/estacionamiento.types";

import RoleGuard from "@/components/RoleGuard";

function CrearEditarPlazaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const estIdToEdit = searchParams.get("estId");
  const plazaIdToEdit = searchParams.get("plazaId");
  const isEditing = !!(estIdToEdit && plazaIdToEdit);

  const [estacionamientos, setEstacionamientos] = useState<Estacionamiento[]>([]);
  const [categorias, setCategorias] = useState<{ id: number, descripcion: string }[]>([]);
  
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ESTADOS DEL FORMULARIO BÁSICO
  const [form, setForm] = useState({
    estId: "",
    categoriaId: "",
    nombre: "",
    tipo: "",
    disponibilidad: true
  });

  // --- ESTADOS PARA CREACIÓN MASIVA ---
  const [isMultiple, setIsMultiple] = useState(false);
  const [loteParams, setLoteParams] = useState({
    cantidad: 10,
    formato: "numero", // Opciones: "numero", "prefijo", "sufijo"
    numeroInicial: 1,
    textoFijo: "A-" // Lo que va antes o después del número
  });

  useEffect(() => {
    const initData = async () => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/"); return; }
  
        try {
          const [ests, cats] = await Promise.all([
            obtenerEstacionamientosActivos(token),
            obtenerCategorias(token)
          ]);
          setEstacionamientos(ests);
          setCategorias(cats);
  
          if (isEditing) {
            setLoadingData(true);
            const data = await obtenerPlazaPorId(Number(estIdToEdit), Number(plazaIdToEdit), token);
            setForm({
              estId: String(data.estId),
              categoriaId: String(data.categoriaId || ""),
              nombre: data.nombre || "",
              tipo: data.tipo || "",
              disponibilidad: data.disponibilidad
            });
            setLoadingData(false);
          } else {
              // Si hay un estacionamiento global, se lo asignamos al form por defecto
              const globalEstId = localStorage.getItem("selectedEstId");
              if (globalEstId) {
                  setForm(prev => ({ ...prev, estId: globalEstId }));
              }
          }
        } catch (error) {
          setAlerta({ type: 'error', text: "Error cargando datos iniciales." });
          setLoadingData(false);
        }
      };
      initData();
  }, [estIdToEdit, plazaIdToEdit, isEditing, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      if (alerta) setAlerta(null);
  };

  const handleLoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setLoteParams(prev => ({ ...prev, [name]: value }));
      if (alerta) setAlerta(null);
  };

  // --- GENERADOR DE VISTA PREVIA DE NOMBRES ---
  const generarNombresPreview = () => {
      const names = [];
      const qty = Number(loteParams.cantidad) || 0;
      const startNum = Number(loteParams.numeroInicial) || 1;

      for (let i = 0; i < qty; i++) {
          const currentNum = startNum + i;
          if (loteParams.formato === "numero") {
              names.push(`${currentNum}`);
          } else if (loteParams.formato === "prefijo") {
              names.push(`${loteParams.textoFijo}${currentNum}`);
          } else if (loteParams.formato === "sufijo") {
              names.push(`${currentNum}${loteParams.textoFijo}`);
          }
      }
      return names;
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.estId || !form.categoriaId || !form.tipo) {
        setAlerta({ type: 'error', text: "Completa los campos obligatorios." });
        return;
      }
      
      if (isMultiple) {
          if (loteParams.cantidad < 2 || loteParams.cantidad > 100) {
              setAlerta({ type: 'error', text: "La cantidad debe ser entre 2 y 100 plazas." });
              return;
          }
          if (loteParams.formato !== "numero" && !loteParams.textoFijo.trim()) {
              setAlerta({ type: 'error', text: "Debe ingresar una letra o texto para el prefijo/sufijo." });
              return;
          }
      }

      setShowModal(true);
  };

  const handleConfirmSave = async () => {
    setShowModal(false);
    setSaving(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      if (isMultiple && !isEditing) {
          // --- GUARDADO MASIVO ---
          const nombresGenerados = generarNombresPreview();
          const payloadLote = {
              estId: Number(form.estId),
              categoriaId: Number(form.categoriaId),
              tipo: form.tipo,
              disponibilidad: form.disponibilidad,
              nombres: nombresGenerados
          };
          await crearPlazasEnLote(payloadLote, token);
          setAlerta({ type: 'success', text: `${loteParams.cantidad} Plazas creadas correctamente.` });
      } else {
          // --- GUARDADO INDIVIDUAL NORMAL ---
          const payload = {
            estId: Number(form.estId),
            categoriaId: Number(form.categoriaId),
            nombre: form.nombre,
            tipo: form.tipo,
            disponibilidad: form.disponibilidad
          };

          if (isEditing) {
            await editarPlaza(Number(estIdToEdit), Number(plazaIdToEdit), payload, token);
            setAlerta({ type: 'success', text: "Plaza actualizada correctamente." });
          } else {
            await crearPlaza(payload, token);
            setAlerta({ type: 'success', text: "Plaza creada correctamente." });
          }
      }

      setTimeout(() => router.push("/plazas"), 2500);

    } catch (error: any) {
      setAlerta({ type: 'error', text: error.message });
      setSaving(false);
    }
  };

  const getIconForCategory = () => {
    if (!form.categoriaId) return null;
    const categoria = categorias.find(c => c.id.toString() === form.categoriaId);
    if (!categoria) return null;

    const iconMap: Record<string, string> = {
      "Automóviles y Camionetas": "Automóviles y Camionetas.png",
      "Motocicletas": "Motocicletas.png",
      "Camiones": "Camiones.png",
      "Ómnibus y Minibuses": "Ómnibus y Minibuses.png",
      "Vehículos agrícolas o especiales": "Vehículos agrícolas o especiales.png",
      "Casas rodantes y Motorhomes": "Casas rodantes y Motorhomes.png",
      "Remolques y acoplados": "Remolques y acoplados.png",
      "Vehículo para personas con discapacidad": "Vehículo para personas con discapacidad.png"
    };

    return iconMap[categoria.descripcion] || null;
  };

  const selectedIcon = getIconForCategory();

  if (loadingData) return <div className="h-screen flex items-center justify-center"><IconLoader2 className="animate-spin"/> Cargando...</div>;

  const InputStyle = "w-full rounded-lg border shadow-sm p-3 border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all";
  const LabelStyle = "block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1";
  
  // Variables de Vista Previa
  const nombresPreview = generarNombresPreview();
  const previewSummary = nombresPreview.length > 5 
    ? `${nombresPreview.slice(0, 4).join(', ')} ... y ${nombresPreview.length - 4} más (hasta ${nombresPreview[nombresPreview.length - 1]}).`
    : nombresPreview.join(', ');

  return (
    <RoleGuard allowedRoles={["Dueño"]}>
    <AppSidebar>
      <div className="flex-1 w-full h-full overflow-y-auto p-4 md:px-10 md:py-6 bg-white dark:bg-neutral-900">
          
          <div className="max-w-2xl mx-auto mt-2">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <IconCarGarage className="h-8 w-8 text-blue-500"/>
              {isEditing ? "Editar Plaza" : "Nueva Plaza"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">             
              <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-xl border border-gray-200 dark:border-neutral-700 space-y-6 shadow-sm">
                
                {/* 1. ESTACIONAMIENTO */}
                <div>
                  <label className={LabelStyle}>Estacionamiento</label>
                  <select 
                    name="estId" 
                    value={form.estId} 
                    onChange={handleChange} 
                    className={InputStyle}
                    // Bloquear si es Editar o si hay un contexto global activo
                    disabled={isEditing || typeof window !== "undefined" && !!localStorage.getItem("selectedEstId")}
                  >
                    <option value="">-- Seleccionar --</option>
                    {estacionamientos.map(est => (
                      <option key={est.id} value={est.id}>{est.nombre}</option>
                    ))}
                  </select>
                </div>

               
                {/* 2. CATEGORÍA DE VEHÍCULO CON ÍCONO A LA DERECHA */}
                <div>
                  <label className={LabelStyle}>Categoría de Vehículo</label>
                  <div className="flex items-center justify-start gap-8"> 
                    <select 
                      name="categoriaId" 
                      value={form.categoriaId} 
                      onChange={handleChange} 
                      className={`${InputStyle} w-full md:w-2/3`} 
                    >
                      <option value="">-- Seleccionar --</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.descripcion}</option>
                      ))}
                    </select>

                    <div className="w-38 h-38 flex items-center justify-center flex-shrink-0">
                      <AnimatePresence mode="popLayout">
                        {selectedIcon && (
                          <motion.div
                            key={selectedIcon}
                            initial={{ opacity: 0, scale: 0.5, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.5, x: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="bg-gray-100 dark:bg-neutral-800 p-3 rounded-2xl shadow-inner border border-gray-200 dark:border-neutral-700 w-full h-full flex items-center justify-center"
                          >
                            <Image 
                              src={`/${selectedIcon}`} 
                              alt="Ícono categoría" 
                              width={150} 
                              height={150} 
                              className="object-contain drop-shadow-md transition-transform hover:scale-110"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                  
                {/* 3. TIPO */}
                <div>
                  <label className={LabelStyle}>Tipo (ej. Cubierto, Exterior)</label>
                  <input type="text" name="tipo" value={form.tipo} onChange={handleChange} className={InputStyle} placeholder="Tipo de plaza..." />
                </div>

                {/* --- SEPARADOR LÓGICO --- */}
                <hr className="border-gray-200 dark:border-neutral-700" />

                {/* --- CONTROL: CREACIÓN ÚNICA VS MULTIPLE --- */}
                {!isEditing && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                        <div className="relative flex items-center justify-center">
                            <input 
                            type="checkbox" 
                            checked={isMultiple} 
                            onChange={(e) => { setIsMultiple(e.target.checked); setAlerta(null); }} 
                            className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-blue-300 dark:border-blue-700 bg-white dark:bg-neutral-800 checked:bg-blue-600 checked:border-blue-600 transition-all" 
                            />
                            <IconCheck size={16} className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                        </div>
                        <label onClick={() => setIsMultiple(!isMultiple)} className="text-base font-semibold text-blue-800 dark:text-blue-300 cursor-pointer select-none flex items-center gap-2">
                            <IconLayersDifference size={20} /> Crear múltiples plazas a la vez
                        </label>
                    </div>
                )}

                {/* --- 4. ZONA DE NOMBRES --- */}
                <AnimatePresence mode="popLayout">
                    {!isMultiple ? (
                        // MODO NORMAL: Un solo input
                        <motion.div key="single-mode" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <label className={LabelStyle}>Nombre o Número de la Plaza (Opcional)</label>
                            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className={InputStyle} placeholder="Ej. A-12, VIP-1..." />
                        </motion.div>
                    ) : (
                        // MODO MASIVO: Panel de generación
                        <motion.div key="multi-mode" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                            <div className="p-5 bg-gray-50 dark:bg-neutral-800/80 rounded-xl border border-gray-200 dark:border-neutral-700">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-neutral-200 mb-4 uppercase tracking-wider">Reglas de Generación</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={LabelStyle}>Cantidad a crear</label>
                                        <input type="number" name="cantidad" min="2" max="100" value={loteParams.cantidad} onChange={handleLoteChange} className={InputStyle} />
                                    </div>
                                    <div>
                                        <label className={LabelStyle}>Formato de Nombre</label>
                                        <select name="formato" value={loteParams.formato} onChange={handleLoteChange} className={InputStyle}>
                                            <option value="numero">Solo Números (1, 2, 3...)</option>
                                            <option value="prefijo">Letra - Número (A-1, A-2...)</option>
                                            <option value="sufijo">Número - Letra (1-A, 2-A...)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className={LabelStyle}>Número Inicial</label>
                                        <input type="number" name="numeroInicial" min="1" value={loteParams.numeroInicial} onChange={handleLoteChange} className={InputStyle} />
                                    </div>
                                    {loteParams.formato !== "numero" && (
                                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                            <label className={LabelStyle}>{loteParams.formato === "prefijo" ? "Letra/Texto Inicial (Prefijo)" : "Letra/Texto Final (Sufijo)"}</label>
                                            <input type="text" name="textoFijo" value={loteParams.textoFijo} onChange={handleLoteChange} placeholder="Ej. A-, VIP-, -B..." className={InputStyle} />
                                        </motion.div>
                                    )}
                                </div>

                                {/* VISTA PREVIA */}
                                <div className="mt-5 p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50 text-sm">
                                    <span className="font-bold text-blue-800 dark:text-blue-300 block mb-1">Vista Previa ({loteParams.cantidad} plazas):</span>
                                    <span className="text-gray-700 dark:text-gray-300 italic">{previewSummary}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 5. DISPONIBILIDAD */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      name="disponibilidad" 
                      checked={form.disponibilidad} 
                      onChange={handleChange} 
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 checked:bg-green-600 checked:border-green-600 transition-all" 
                    />
                    <IconCheck size={16} className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                  </div>
                  
                  <label 
                    onClick={() => setForm(prev => ({...prev, disponibilidad: !prev.disponibilidad}))}
                    className="text-base font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                  >
                    Plazas Disponibles (Activas)
                  </label>
                </div>

              </div>

              {/* BOTONES Y ALERTAS */}
              <div className="mt-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <button type="submit" disabled={saving} className="relative inline-flex h-12 w-full md:w-auto overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-70 disabled:cursor-not-allowed">
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#2563EB_50%,#60A5FA_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-blue-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                            {saving ? <IconLoader2 className="animate-spin" size={20} /> : <IconDeviceFloppy size={20} />} 
                            {isEditing ? "Actualizar Plaza" : (isMultiple ? "Crear Lote de Plazas" : "Guardar Plaza")}
                        </span>
                    </button>

                    <button type="button" onClick={() => router.push("/plazas")} className="relative inline-flex h-12 w-full md:w-auto overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F87171_0%,#DC2626_50%,#F87171_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-red-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                            <IconX size={20} /> Cancelar
                        </span>
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {alerta && (
                        <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.2 }}
                            className={cn("p-4 rounded-lg flex items-start gap-3 shadow-sm border mt-6", alerta.type === 'success' ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400" : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400")}>
                            {alerta.type === 'success' ? <IconCheck className="h-5 w-5 mt-0.5 flex-shrink-0" /> : <IconInfoCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                            <div className="flex-1 text-sm font-medium">{alerta.text}</div>
                            <button type="button" onClick={() => setAlerta(null)} className="opacity-50 hover:opacity-100 transition-opacity"><IconX size={18} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </form>
          </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl p-2 bg-yellow-400 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-white dark:bg-black rounded-[14px] w-full h-full p-8 flex flex-col items-center text-center">
                <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
                    <IconAlertTriangle className="h-20 w-20 text-yellow-500 relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">Confirmar {isEditing ? "Edición" : "Creación"}</h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-8">¿Estás seguro que deseas {isEditing ? "actualizar los datos de esta Plaza" : (isMultiple ? `registrar ${loteParams.cantidad} Plazas` : "registrar esta Plaza")}?</p>
                <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                    <button type="button" onClick={handleConfirmSave} className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 group">
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#2563EB_50%,#60A5FA_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-blue-400 backdrop-blur-3xl group-hover:bg-slate-900 transition-colors">
                            <IconCheck size={25} /> Confirmar
                        </span>
                    </button>
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
    </RoleGuard>
  );
}

export default function Page() {
  return <Suspense fallback={<div>Cargando...</div>}><CrearEditarPlazaContent /></Suspense>;
}