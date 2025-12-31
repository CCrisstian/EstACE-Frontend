// src/components/MapaSelector.tsx
'use client'; // Indica que este componente corre en el navegador

import { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Estilos necesarios para Leaflet
import 'leaflet/dist/leaflet.css';

// ---------------------------------------------------------
// FIX: Iconos de Leaflet en Next.js
// Por defecto, Leaflet pierde las imágenes de los iconos en Next.js. Esto lo arregla.
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
// ---------------------------------------------------------

interface Coordenadas {
  lat: number;
  lon: number;
}

interface MapaSelectorProps {
  coords: Coordenadas | null; // Coordenadas actuales (pueden ser null al inicio)
  onCoordenadasChange: (lat: number, lon: number) => void; // Función para avisar al padre del cambio
}

// Sub-componente auxiliar para mover la cámara cuando cambian las coordenadas externas (buscador)
function RecenterMap({ coords }: { coords: Coordenadas }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([coords.lat, coords.lon], 16); // Zoom 16 al encontrar dirección
  }, [coords, map]);
  return null;
}

export default function MapaSelector({ coords, onCoordenadasChange }: MapaSelectorProps) {
  
  // Coordenadas por defecto (Centro de Argentina o tu ciudad preferida)
  // Si no hay coordenadas, mostramos un punto neutro (ej: Obelisco BsAs)
  const centroInicial = { lat: -34.6037, lon: -58.3816 };
  const posicion = coords || centroInicial;

  // Referencia al marcador para poder acceder a sus eventos
  const markerRef = useRef<L.Marker>(null);

  // Manejador del evento "Arrastrar terminadp" (DragEnd)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          // Avisamos al formulario padre que el usuario movió el pin manualmente
          onCoordenadasChange(lat, lng);
        }
      },
    }),
    [onCoordenadasChange],
  );

  return (
    <div className="h-full w-full min-h-[400px] rounded-lg overflow-hidden border border-gray-300">
        <MapContainer 
            center={[posicion.lat, posicion.lon]} 
            zoom={coords ? 16 : 5} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Solo mostramos el marcador si tenemos coordenadas válidas o el usuario está interactuando */}
            {coords && (
                <>
                    <Marker 
                        position={[coords.lat, coords.lon]} 
                        icon={iconDefault}
                        draggable={true} // ¡Importante! Permite arrastrar
                        eventHandlers={eventHandlers}
                        ref={markerRef}
                    >
                        <Popup>
                            Ubicación del Estacionamiento. <br /> Arrástrame para ajustar.
                        </Popup>
                    </Marker>
                    <RecenterMap coords={coords} />
                </>
            )}
        </MapContainer>
    </div>
  );
}