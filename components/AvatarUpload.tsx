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
}

export default function AvatarUpload({ 
  usuarioLegajo, 
  currentAvatarUrl, 
  onAvatarUpdate, 
  onShowAlert,
  onRequestDelete 
}: AvatarUploadProps) {
  
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);

  // Mantenemos la lógica de SUBIDA aquí para encapsular la complejidad del File Input
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

      // 1. Subir a Supabase
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // 2. Actualizar Backend (Llamada al endpoint PATCH)
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

      // 3. Feedback
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
    <div className="flex flex-col items-center gap-4">
        {/* Foto */}
        <div className="relative group w-48 h-48">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white dark:border-neutral-700 shadow-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center relative">
                {uploading ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <IconLoader2 className="animate-spin text-white" size={40} />
                </div>
                ) : null}
                
                {preview ? (
                <Image 
                    src={preview} 
                    alt="Avatar" 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 100vw, 300px"
                />
                ) : (
                <IconUser size={90} className="text-gray-300 dark:text-neutral-600" />
                )}
            </div>

            {/* Botón CAMBIAR */}
            <label className="absolute bottom-2 right-2 bg-blue-600 p-3 rounded-full text-white cursor-pointer hover:bg-blue-700 transition shadow-lg z-20 hover:scale-105 active:scale-95">
                <IconCamera size={22} />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>

            {/* Botón BORRAR */}
            {preview && (
                <button 
                    onClick={onRequestDelete}
                    disabled={uploading}
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white cursor-pointer hover:bg-red-600 transition shadow-lg z-20 hover:scale-105 active:scale-95 border-2 border-white dark:border-neutral-900"
                    title="Eliminar foto"
                >
                    <IconTrash size={18} />
                </button>
            )}
        </div>
    </div>
  );
}