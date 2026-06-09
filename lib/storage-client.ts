const ALLOWED_TYPES = ['jpg', 'jpeg', 'png', 'heic', 'webp', 'gif', 'pdf']

interface UploadResult {
  success: boolean
  url?: string
  filename?: string
  size_kb?: number
  error?: string
}

interface DeleteResult {
  success: boolean
  error?: string
}

export const storageClient = {
  async upload(bucket: string, file: File): Promise<UploadResult> {
    try {
      // Validar tipo de archivo
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!ext || !ALLOWED_TYPES.includes(ext)) {
        return { success: false, error: `Tipo no permitido. Usa: ${ALLOWED_TYPES.join(', ')}` }
      }

      // Validar tamaño (máximo 10MB)
      const size_mb = file.size / (1024 * 1024)
      if (size_mb > 10) {
        return { success: false, error: 'Archivo muy grande. Máximo 10MB.' }
      }

      console.log('[Storage] Uploading:', { bucket, filename: file.name, size: file.size })

      // Subir via API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[Storage] Upload error:', data.error)
        return { success: false, error: data.error || 'Error al subir' }
      }

      console.log('[Storage] Upload success:', data.filename)

      return {
        success: true,
        url: data.url,
        filename: data.filename,
        size_kb: data.size_kb,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err)
      console.error('[Storage] Exception:', message)
      return { success: false, error: message }
    }
  },

  async delete(bucket: string, filename: string): Promise<DeleteResult> {
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket, filename }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Error al eliminar' }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  },

  getPublicUrl(bucket: string, filename: string): string {
    return `https://yvohgdsdjzxtqomkixkl.supabase.co/storage/v1/object/public/${bucket}/${filename}`
  },
}
