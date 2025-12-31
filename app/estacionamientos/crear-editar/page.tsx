"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Componentes UI
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconChevronLeft, IconMapPin, IconClock, IconCalendar, IconDeviceFloppy, IconLoader2, IconMap2, IconX, IconAlertTriangle } from "@tabler/icons-react";

// Servicios
import { obtenerProvincias, obtenerLocalidades } from "@/services/georef";
import { obtenerCoordenadas, obtenerDireccionDesdeCoordenadas } from "@/services/geocoding";
import { obtenerPerfil } from "@/services/userService"; 
import { UsuarioResponse } from "@/types/usuario.types";

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

export default function CrearEstacionamientoPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  
  // Modal de confirmación
  const [showModal, setShowModal] = useState(false);

  // Estados de carga y usuario
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  
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
    
    // Horarios
    diaInicio: 'Lunes',
    diaFin: 'Viernes',
    horaInicio: '08:00',
    horaFin: '20:00',
    
    // Finde
    atiendeFinde: false,
    horaFindeInicio: '09:00',
    horaFindeFin: '13:00',
    
    // Extras
    atiendeFeriados: false,
    disponible: true
  });

  // --- EFECTOS ---
  useEffect(() => {
    const initData = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const userData = await obtenerPerfil(token);
                setUsuario(userData);
            } catch (e) { console.error(e); }
        }
        const provData = await obtenerProvincias();
        setProvincias(provData);
    };
    initData();
  }, []);

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
  };

  const handleBuscarUbicacion = async () => {
    if (!form.direccion || !form.localidad || !form.provincia) {
      alert("Completa la dirección, localidad y provincia.");
      return;
    }
    setLoadingMap(true);
    const coords = await obtenerCoordenadas(form.direccion, form.localidad, form.provincia);
    setLoadingMap(false);

    if (coords.lat && coords.lon) {
      setForm(prev => ({ ...prev, latitud: coords.lat, longitud: coords.lon }));
    } else {
      alert("No se encontró la ubicación. Intenta ajustar el texto o usa el mapa.");
    }
  };

  const handleCoordenadasChange = async (lat: number, lon: number) => {
    setForm(prev => ({ ...prev, latitud: lat, longitud: lon }));
    
    const data = await obtenerDireccionDesdeCoordenadas(lat, lon);
    
    if (data) {
       const direccionCompleta = data.altura 
            ? `${data.calle} ${data.altura}` 
            : data.calle;

       setForm(prev => ({
          ...prev,
          direccion: direccionCompleta || prev.direccion, 
       }));
    }
  };

  // PASO 1: Validación inicial (al hacer click en "Guardar")
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!form.nombre || !form.provincia || !form.localidad || !form.direccion) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
    }

    if (!form.latitud || !form.longitud) {
        alert("Debes validar la dirección usando el botón del mapa o seleccionando una ubicación.");
        return;
    }

    if (form.horaInicio >= form.horaFin) {
        alert("El horario de apertura debe ser anterior al de cierre.");
        return;
    }

    if (form.atiendeFinde) {
        if (form.horaFindeInicio >= form.horaFindeFin) {
            alert("El horario de fin de semana (apertura) debe ser anterior al de cierre.");
            return;
        }
    }

    // SI PASA LAS VALIDACIONES, MOSTRAMOS EL MODAL
    setShowModal(true);
  };

  // PASO 2: Confirmación real (dentro del modal)
  const handleConfirmSave = async () => {
    // Cerrar modal
    setShowModal(false);

    const datosParaBackend = {
        est_nombre: form.nombre,
        est_provincia: form.provincia,
        est_localidad: form.localidad,
        est_direccion: form.direccion,
        est_latitud: form.latitud,
        est_longitud: form.longitud,
        est_dias_atencion: `${form.diaInicio} a ${form.diaFin}`,
        est_hra_atencion: `${form.horaInicio} - ${form.horaFin}`,
        est_fin_de_semana_atencion: form.atiendeFinde,
        est_hora_fin_de_semana: form.atiendeFinde ? `${form.horaFindeInicio} - ${form.horaFindeFin}` : null,
        est_dias_feriado_atencion: form.atiendeFeriados,
        est_disponibilidad: form.disponible
    };

    try {
        console.log("Enviando datos confirmados:", datosParaBackend);
        // Aquí iría tu fetch real
        alert("¡Estacionamiento creado con éxito!");
        router.push("/estacionamientos");

    } catch (error) {
        console.error(error);
        alert("Ocurrió un error al guardar.");
    }
  };

  const handleCancelClick = () => {
    router.push("/estacionamientos");
  };

  // --- UI COMPONENTS ---
  const InputStyle = "w-full rounded-lg border shadow-sm p-3 transition-colors border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none";
  const LabelStyle = "block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1";

  const links = [
    { label: "Volver", href: "/estacionamientos", icon: <IconChevronLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-200" /> },
  ];

  return (
    <div className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-900 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}>
      
      {/* SIDEBAR */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden mt-2">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-4 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div key={idx}><SidebarLink link={link} /></div>
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: usuario ? `${usuario.nombre} ${usuario.apellido}` : "Usuario",
                href: "/perfil",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-xs font-bold text-white">
                    {usuario?.nombre?.charAt(0) || "U"}
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 w-full h-full overflow-hidden bg-white dark:bg-neutral-900">
        <div className="w-full h-full overflow-y-auto p-4 md:p-8 relative">
            
            <div className="max-w-5xl mx-auto mt-6 pb-20">
                
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Nuevo Estacionamiento</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Completa la información para registrar una nueva playa.</p>
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

                    {/* SECCIÓN 3: EXTRAS Y BOTÓN DE GUARDAR */}
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

                        {/* BOTÓN GUARDAR DEL FORMULARIO PRINCIPAL */}
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <button 
                                type="submit" 
                                className="relative inline-flex h-12 w-full md:w-auto overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                            >
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#2563EB_50%,#60A5FA_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-blue-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                                    <IconDeviceFloppy size={25} /> Guardar
                                </span>
                            </button>

                            <button 
                                type="button" 
                                onClick={handleCancelClick} 
                                className="relative inline-flex h-12 w-full md:w-auto overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                            >
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F87171_0%,#DC2626_50%,#F87171_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-red-400 backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                                    <IconX size={25} /> Cancelar
                                </span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
      </div>

      {/* --- MODAL CONFIRMACIÓN --- */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          
          {/* REEMPLAZO: Contenedor estático para simular el borde amarillo sin efectos extraños */}
          <div className="relative w-full max-w-md rounded-2xl p-2 bg-yellow-400 shadow-2xl animate-in fade-in zoom-in duration-300">
            
            {/* Contenido interior (Fondo negro/blanco) */}
            <div className="bg-white dark:bg-black rounded-[14px] w-full h-full p-8 flex flex-col items-center text-center">
                
                {/* Icono Amarillo */}
                <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
                    <IconAlertTriangle className="h-20 w-20 text-yellow-500 relative z-10" />
                </div>

                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                    Confirmación
                </h2>
                
                <p className="text-neutral-600 dark:text-neutral-300 mb-8">
                    ¿Esta seguro que desea crear un Nuevo Estacionamiento?
                </p>

                {/* BOTONES DEL MODAL */}
                <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                    
                    {/* ACEPTAR (Izquierda) */}
                    <button 
                        type="button" 
                        onClick={handleConfirmSave}
                        className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[6px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 group"
                    >
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#2563EB_50%,#60A5FA_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-blue-400 backdrop-blur-3xl group-hover:bg-slate-900 transition-colors">
                            <IconDeviceFloppy size={25} /> Aceptar
                        </span>
                    </button>

                    {/* CANCELAR (Derecha) */}
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

    </div>
  );
}

// Logo Components
export const Logo = () => {
  return (
    <Link href="/dashboard" className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <div className="h-8 w-8 relative overflow-hidden rounded-full flex-shrink-0">
        <Image src="/LogoACE_SinFondo.png" alt="Logo EstACE" fill className="object-cover" />
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
        <Image src="/LogoACE_SinFondo.png" alt="Logo EstACE" fill className="object-cover" />
      </div>
    </Link>
  );
};