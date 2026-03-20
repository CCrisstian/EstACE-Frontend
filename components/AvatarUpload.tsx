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
        <div className="relative w-40 h-40">
            
            {/* Foto actual */}
            <div 
                className={`relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-neutral-800 shadow-lg ${currentAvatarUrl ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                onClick={onAvatarClick} 
                title={currentAvatarUrl ? "Clic para ver en grande" : ""}
            >
                {uploading ? (
                    <div className="w-full h-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                        <IconLoader2 className="animate-spin text-blue-500" size={30} />
                    </div>
                ) : preview || currentAvatarUrl ? (
                    <Image
                        src={preview || currentAvatarUrl || ""}
                        alt="Avatar"
                        fill
                        className="object-cover"
                        sizes="160px"
                        unoptimized={!!preview}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                        <IconUser className="h-16 w-16 text-gray-400" />
                    </div>
                )}
            </div>
            
            {/* Botón CAMBIAR */}
            <label className="absolute bottom-0 right-0 bg-blue-600 p-3 rounded-full text-white cursor-pointer hover:bg-blue-700 transition shadow-lg z-20 hover:scale-105 active:scale-95">
                <IconCamera size={22} />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>

            {/* Botón BORRAR */}
            {preview && (
                <button 
                    onClick={onRequestDelete}
                    disabled={uploading}
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 p-2 rounded-full text-white cursor-pointer hover:bg-red-600 transition shadow-lg z-20 hover:scale-105 active:scale-95 border-2 border-white dark:border-neutral-900"
                    title="Eliminar foto"
                >
                    <IconTrash size={18} />
                </button>
            )}
            
        </div>
    </div>
  );
}