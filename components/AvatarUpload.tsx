"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IconCamera, IconLoader2, IconUser, IconTrash } from "@tabler/icons-react";
import { supabase } from "@/lib/supabase"; 

interface AvatarUploadProps {
  usuarioLegajo: number;
  currentAvatarUrl?: string | null; 
  
  onAvatarUpdate: (newUrl: string | null) => void;
  onShowAlert: (type: 'success' | 'error', text: string) => void;
  onRequestDelete: () => void; 

  onAvatarClick?: () => void;
}

export default function AvatarUpload({ 
  usuarioLegajo, 
  currentAvatarUrl, 
  onAvatarUpdate, 
  onShowAlert,
  onRequestDelete,
  onAvatarClick 
}: AvatarUploadProps) {
  
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onShowAlert('error', "Solo se permiten archivos de imagen.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) { 
      onShowAlert('error', "La imagen es muy pesada (Máximo 2MB).");
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${usuarioLegajo}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${usuarioLegajo}/avatar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatarUrl: publicUrl })
      });

      if (!res.ok) throw new Error("Error sincronizando con el servidor.");

      setPreview(publicUrl);
      onAvatarUpdate(publicUrl);
      onShowAlert('success', "Foto de perfil actualizada correctamente.");

    } catch (error: any) {
      console.error(error);
      onShowAlert('error', error.message || "Error al subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
        
        {/* Contenedor relativo que agrupa la foto y los botones */}
        <div className="relative w-64 h-64 lg:w-72 lg:h-72">
            
            {/* Foto actual */}
            <div 
                className={`relative w-full h-full rounded-full overflow-hidden border-[6px] border-white dark:border-neutral-800 shadow-xl bg-gray-100 dark:bg-neutral-800 ${currentAvatarUrl ? 'cursor-pointer hover:scale-105 transition-transform duration-300' : ''}`}
                onClick={onAvatarClick} 
                title={currentAvatarUrl ? "Clic para ver en grande" : ""}
            >
                {uploading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <IconLoader2 className="animate-spin text-blue-500" size={48} />
                    </div>
                ) : preview || currentAvatarUrl ? (
                    <Image
                        src={preview || currentAvatarUrl || ""}
                        alt="Avatar"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 256px, 288px"
                        unoptimized={!!preview}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <IconUser className="h-32 w-32 text-gray-400" />
                    </div>
                )}
            </div>
            
            {/* Botón CAMBIAR (Cámara) */}
            <label className="absolute bottom-2 right-2 lg:bottom-4 lg:right-4 bg-blue-600 p-4 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-all shadow-xl z-20 hover:scale-110 active:scale-95 border-4 border-white dark:border-neutral-900">
                <IconCamera size={28} />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>

            {/* Botón BORRAR (Basura) */}
            {preview && (
                <button 
                    onClick={onRequestDelete}
                    disabled={uploading}
                    type="button"
                    className="absolute top-2 right-2 lg:top-4 lg:right-4 bg-red-500 p-3 rounded-full text-white cursor-pointer hover:bg-red-600 transition-all shadow-xl z-20 hover:scale-110 active:scale-95 border-4 border-white dark:border-neutral-900"
                    title="Eliminar foto"
                >
                    <IconTrash size={24} />
                </button>
            )}
            
        </div>
    </div>
  );
}