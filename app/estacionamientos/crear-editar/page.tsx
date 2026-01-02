"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";

// 1. Importamos el Wrapper del Sidebar
import { AppSidebar } from "@/components/AppSidebar";

// 2. Importamos los iconos necesarios
import { 
  IconMapPin, 
  IconClock, 
  IconCalendar, 
  IconDeviceFloppy, 
  IconMap2, 
  IconLoader2, 
  IconX,
  IconAlertTriangle,
  IconCheck,       
  IconInfoCircle   
} from "@tabler/icons-react";

// 3. Importamos Framer Motion para las animaciones de la alerta
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Servicios
import { obtenerProvincias, obtenerLocalidades } from "@/services/georef";
import { obtenerCoordenadas, obtenerDireccionDesdeCoordenadas } from "@/services/geocoding";
import { 
  crearEstacionamiento, 
  editarEstacionamiento, 
  obtenerEstacionamientoPorId 
} from "@/services/estacionamientoService";

// Importación Dinámica del Mapa
const MapaSelector = dynamic(
  () => import("@/components/MapaSelector").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 dark:bg-neutral-800 animate-pulse flex items-center justify-center text-gray-500 text-sm">
        <IconLoader2 className="animate-spin mr-2" /> Cargando Mapa...
      </div>
    ),
  }
);

// Constantes
const HORAS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function CrearEditarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idToEdit = searchParams.get("id"); 
  
  // Estados de carga
  const [loadingMap, setLoadingMap] = useState(false);
  const [saving, setSaving] = useState(false); 
  const [loadingData, setLoadingData] = useState(false);
  
  // --- ESTADOS DE UI: ALERTAS Y MODAL ---
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Datos Geográficos
  const [provincias, setProvincias] = useState<{ id: string; nombre: string }[]>([]);
  const [localidades, setLocalidades] = useState<{ id: string; nombre: string }[]>([]);

  // Formulario
  const [form, setForm] = useState({
    nombre: '',
    provincia: '',
    localidad: '',
    direccion: '',
    latitud: null as number | null,
    longitud: null as number | null,
    diaInicio: 'Lunes',
    diaFin: 'Viernes',
    horaInicio: '00:00',
    horaFin: '00:00',
    atiendeFinde: false,
    horaFindeInicio: '00:00',
    horaFindeFin: '00:00',
    atiendeFeriados: false,
    disponible: true
  });

  // --- EFECTOS ---

  useEffect(() => {
    const initData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
           router.push("/");
           return;
        }

        try {
            const provData = await obtenerProvincias();
            setProvincias(provData);

            if (idToEdit) {
                setLoadingData(true);
                const est = await obtenerEstacionamientoPorId(Number(idToEdit), token);
                
                const [dInicio, dFin] = est.diasAtencion ? est.diasAtencion.split(" a ") : ["Lunes", "Viernes"];
                const [hInicio, hFin] = est.hraAtencion ? est.hraAtencion.split(" - ") : ["00:00", "00:00"];
                
                let hFindeInicio = "00:00";
                let hFindeFin = "00:00";
                if (est.horaFinDeSemana) {
                   const splitFinde = est.horaFinDeSemana.split(" - ");
                   if (splitFinde.length === 2) {
                       hFindeInicio = splitFinde[0];
                       hFindeFin = splitFinde[1];
                   }
                }

                setForm({
                    nombre: est.nombre,
                    provincia: est.provincia,
                    localidad: est.localidad,
                    direccion: est.direccion,
                    latitud: est.latitud,
                    longitud: est.longitud,
                    diaInicio: dInicio,
                    diaFin: dFin,
                    horaInicio: hInicio,
                    horaFin: hFin,
                    atiendeFinde: est.finDeSemanaAtencion,
                    horaFindeInicio: hFindeInicio,
                    horaFindeFin: hFindeFin,
                    atiendeFeriados: est.diasFeriadoAtencion,
                    disponible: est.disponibilidad
                });
                setLoadingData(false);
            }
        } catch (e) { 
            console.error(e); 
            setAlerta({ type: 'error', text: "Error cargando datos iniciales." });
        }
    };
    initData();
  }, [idToEdit, router]);

  useEffect(() => {
    async function loadLocalidades() {
      if (!form.provincia) {
        setLocalidades([]);
        return;
      }
      const data = await obtenerLocalidades(form.provincia);
      setLocalidades(data);
    }
    loadLocalidades();
  }, [form.provincia]);


  // --- HANDLERS ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiamos la alerta al corregir
    if (alerta) setAlerta(null); 
  };

  const handleBuscarUbicacion = async () => {
    if (!form.direccion || !form.localidad || !form.provincia) {
      setAlerta({ type: 'error', text: "Completa la dirección, localidad y provincia para buscar." });
      return;
    }
    setLoadingMap(true);
    setAlerta(null);
    try {
        const coords = await obtenerCoordenadas(form.direccion, form.localidad, form.provincia);
        if (coords.lat && coords.lon) {
            setForm(prev => ({ ...prev, latitud: coords.lat, longitud: coords.lon }));
        } else {
            setAlerta({ type: 'error', text: "No se encontró la ubicación. Intenta ajustar el texto o usa el mapa." });
        }
    } catch {
        setAlerta({ type: 'error', text: "Error al conectar con el servicio de mapas." });
    } finally {
        setLoadingMap(false);
    }
  };

  const handleCoordenadasChange = async (lat: number, lon: number) => {
    setForm(prev => ({ ...prev, latitud: lat, longitud: lon }));
    const data = await obtenerDireccionDesdeCoordenadas(lat, lon);
    if (data) {
       const direccionCompleta = data.altura ? `${data.calle} ${data.altura}` : data.calle;
       setForm(prev => ({ ...prev, direccion: direccionCompleta || prev.direccion }));
    }
  };

  // PASO 1: Validaciones (Abre el Modal)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!form.nombre || !form.provincia || !form.localidad || !form.direccion) {
        setAlerta({ type: 'error', text: "Por favor, completa todos los campos obligatorios de ubicación." });
        return;
    }
    if (!form.latitud || !form.longitud) {
        setAlerta({ type: 'error', text: "Es necesario validar la ubicación en el mapa." });
        return;
    }
    if (form.horaInicio >= form.horaFin) {
        setAlerta({ type: 'error', text: "El horario de apertura debe ser anterior al de cierre." });
        return;
    }

    // Si todo OK, limpiamos alertas y mostramos modal
    setAlerta(null);
    setShowModal(true);
  };

  // PASO 2: Confirmación y Guardado (API)
  const handleConfirmSave = async () => {
    setShowModal(false);
    setSaving(true);

    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No hay sesión activa");

        const datosParaBackend = {
            nombre: form.nombre,
            provincia: form.provincia,
            localidad: form.localidad,
            direccion: form.direccion,
            latitud: form.latitud,
            longitud: form.longitud,
            diasAtencion: `${form.diaInicio} a ${form.diaFin}`,
            hraAtencion: `${form.horaInicio} - ${form.horaFin}`,
            finDeSemanaAtencion: form.atiendeFinde,
            horaFinDeSemana: form.atiendeFinde ? `${form.horaFindeInicio} - ${form.horaFindeFin}` : null,
            diasFeriadoAtencion: form.atiendeFeriados,
            disponibilidad: form.disponible
        };

        if (idToEdit) {
            await editarEstacionamiento(Number(idToEdit), datosParaBackend, token);
            // Mensaje Personalizado EDICIÓN
            setAlerta({ type: 'success', text: "¡Cambios guardados! Tu Estacionamiento ha sido Actualizado correctamente." });
        } else {
            await crearEstacionamiento(datosParaBackend, token);
            // Mensaje Personalizado CREACIÓN
            setAlerta({ type: 'success', text: "¡Éxito! Se ha registrado el Nuevo Estacionamiento." });
        }

        // Redirección automática después de 2 segundos
        setTimeout(() => {
            router.push("/estacionamientos");
        }, 10000);

    } catch (error: any) {
        setAlerta({ type: 'error', text: error.message || "Ocurrió un error al guardar." });
        setSaving(false); 
    }
  };

  const handleCancelClick = () => {
    router.push("/estacionamientos");
  };

  // --- STYLES ---
  const InputStyle = "w-full rounded-lg border shadow-sm p-3 transition-colors border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none";
  const LabelStyle = "block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1";

  if (loadingData) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-neutral-900">
            <div className="flex flex-col items-center gap-2">
                <IconLoader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-gray-500">Cargando datos del estacionamiento...</p>
            </div>
        </div>
      );
  }

  return (
    <AppSidebar>
      <div className="flex-1 w-full h-full overflow-hidden bg-white dark:bg-neutral-900">
        <div className="w-full h-full overflow-y-auto p-4 md:p-8 relative">
            
            <div className="max-w-5xl mx-auto mt-6 pb-20">
                
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {idToEdit ? "Editar Estacionamiento" : "Nuevo Estacionamiento"}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {idToEdit ? "Modifica los datos de tu playa." : "Completa la información para registrar una nueva playa."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* SECCIÓN 1: DATOS */}
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-0 md:p-1">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            <div className="space-y-5">
                                <div>
                                    <label className={LabelStyle}>Nombre del Estacionamiento</label>
                                    <input 
                                        type="text" name="nombre" value={form.nombre} onChange={handleChange} required 
                                        className={InputStyle} placeholder="Ej: Estacionamiento Central"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={LabelStyle}>Provincia</label>
                                        <select name="provincia" value={form.provincia} onChange={handleChange} required className={InputStyle}>
                                            <option value="">Seleccionar...</option>
                                            {provincias.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={LabelStyle}>Localidad</label>
                                        <select name="localidad" value={form.localidad} onChange={handleChange} required disabled={!form.provincia} className={InputStyle}>
                                            <option value="">Seleccionar...</option>
                                            {localidades.map(l => <option key={l.id} value={l.nombre}>{l.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className={LabelStyle}>Dirección (Calle y Altura)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" name="direccion" value={form.direccion} onChange={handleChange} required
                                            placeholder="Ej: Av. 9 de Julio 100" className={InputStyle}
                                        />
                                        <button 
                                            type="button" onClick={handleBuscarUbicacion}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg transition-colors flex items-center justify-center min-w-[50px]"
                                            title="Buscar en mapa"
                                        >
                                            {loadingMap ? <IconLoader2 className="animate-spin h-5 w-5" /> : <IconMap2 className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5 ml-1">
                                        Escribe la dirección y pulsa el botón del mapa, o arrastra el pin en el mapa.
                                    </p>
                                </div>
                            </div>

                            {/* MAPA */}
                            <div className="h-[300px] lg:h-auto min-h-[300px] w-full rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-700 shadow-sm relative group">
                                <MapaSelector 
                                    coords={form.latitud && form.longitud ? { lat: form.latitud, lon: form.longitud } : null}
                                    onCoordenadasChange={handleCoordenadasChange}
                                />
                                {!form.latitud && (
                                    <div className="absolute inset-0 bg-black/5 dark:bg-black/40 flex items-center justify-center pointer-events-none">
                                        <div className="bg-white dark:bg-neutral-800 px-4 py-2 rounded-full shadow-lg text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                            <IconMapPin size={16} /> Selecciona una ubicación
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-neutral-800 my-6"></div>

                    {/* SECCIÓN 2: HORARIOS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <IconClock className="text-blue-500" />
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Horarios y Atención</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 dark:bg-neutral-800/50 p-5 rounded-xl border border-gray-100 dark:border-neutral-800">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Días Hábiles</h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Desde</label>
                                        <select name="diaInicio" value={form.diaInicio} onChange={handleChange} className={InputStyle}>{DIAS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Hasta</label>
                                        <select name="diaFin" value={form.diaFin} onChange={handleChange} className={InputStyle}>{DIAS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Apertura</label>
                                        <select name="horaInicio" value={form.horaInicio} onChange={handleChange} className={InputStyle}>{HORAS.map(h => <option key={h} value={h}>{h}</option>)}</select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Cierre</label>
                                        <select name="horaFin" value={form.horaFin} onChange={handleChange} className={InputStyle}>{HORAS.map(h => <option key={h} value={h}>{h}</option>)}</select>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-5 rounded-xl border transition-all ${form.atiendeFinde ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30' : 'bg-gray-50 dark:bg-neutral-800/50 border-gray-100 dark:border-neutral-800 opacity-60'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Fines de Semana</h4>
                                    <input type="checkbox" name="atiendeFinde" checked={form.atiendeFinde} onChange={handleChange} className="h-5 w-5 accent-blue-600 rounded cursor-pointer" />
                                </div>
                                
                                <div className={form.atiendeFinde ? "" : "pointer-events-none grayscale"}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Apertura</label>
                                            <select name="horaFindeInicio" value={form.horaFindeInicio} onChange={handleChange} className={InputStyle}>{HORAS.map(h => <option key={h} value={h}>{h}</option>)}</select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Cierre</label>
                                            <select name="horaFindeFin" value={form.horaFindeFin} onChange={handleChange} className={InputStyle}>{HORAS.map(h => <option key={h} value={h}>{h}</option>)}</select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: EXTRAS Y BOTONES */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6">
                        <div className="flex gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" name="atiendeFeriados" checked={form.atiendeFeriados} onChange={handleChange} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 checked:bg-blue-600 checked:border-blue-600 transition-all" />
                                    <IconCalendar className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white p-0.5" size={20} />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">Atiende Feriados</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" name="disponible" checked={form.disponible} onChange={handleChange} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 checked:bg-green-600 checked:border-green-600 transition-all" />
                                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 text-white font-bold text-xs">✓</span>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-green-600 transition-colors font-medium">Disponible</span>
                            </label>
                        </div>

                        {/* BOTONES */}
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
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

                            <button 
                                type="button" 
                                onClick={handleCancelClick} 
                                className="relative inline-flex h-12 w-full md:w-auto overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                            >
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F87171_0%,#DC2626_50%,#F87171_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-red-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                                    <IconX size={20} /> Cancelar
                                </span>
                            </button>
                        </div>
                    </div>
                    {/* --- AQUÍ ESTÁ EL BLOQUE DE ALERTAS VISUALES --- */}
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
                                
                                {/* Botón para cerrar alerta manualmente */}
                                <button type="button" onClick={() => setAlerta(null)} className="opacity-50 hover:opacity-100">
                                    <IconX size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
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
                    ¿Estás seguro que deseas {idToEdit ? "Actualizar los datos de" : "Registrar"} este Estacionamiento?
                </p>

                <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                    
                    {/* ACEPTAR */}
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

                    {/* CANCELAR */}
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
  );
}

// Wrapper para Suspense
export default function CrearEstacionamientoPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-neutral-900">Cargando...</div>}>
            <CrearEditarContent />
        </Suspense>
    );
}