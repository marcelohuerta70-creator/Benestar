'use client'

import { useState, useRef } from 'react'
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useFileUpload } from '@/lib/hooks/use-file-upload'
import { truncateFilename } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface FileUploaderProps {
  bucket: string
  label?: string
  onUploadSuccess?: (result: { url: string; filename: string; size_kb: number }) => void
  onUploadError?: (error: string) => void
  multiple?: boolean
  maxFiles?: number
}

interface UploadedFile {
  id: string
  name: string
  url: string | null
  size_kb: number
  status: 'success' | 'error'
  message?: string
}

export function FileUploader({
  bucket,
  label = 'Subir archivo',
  onUploadSuccess,
  onUploadError,
  multiple = true,
  maxFiles = 5,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload, uploading, error } = useFileUpload(bucket)

  async function handleFiles(fileList: FileList) {
    if (!multiple && files.length > 0) {
      setFiles([])
    }

    const filesToUpload = Array.from(fileList)
    if (fileList.length + files.length > maxFiles) {
      const errorMsg = `Máximo ${maxFiles} archivos`
      setFiles(prev => [...prev, { id: Date.now().toString(), name: errorMsg, url: '', size_kb: 0, status: 'error', message: errorMsg }])
      onUploadError?.(errorMsg)
      return
    }

    for (const file of filesToUpload) {
      const uploadId = Date.now().toString() + Math.random()
      setFiles(prev => [...prev, { id: uploadId, name: file.name, url: null, size_kb: 0, status: 'success', message: 'Subiendo...' }])

      const result = await upload(file)

      if (result && result.url) {
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadId
              ? { id: f.id, name: f.name, url: result.url || null, size_kb: result.size_kb || 0, status: 'success' as const }
              : f
          )
        )
        onUploadSuccess?.(result as any)
      } else {
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadId
              ? { ...f, status: 'error' as const, message: error || 'Error al subir' }
              : f
          )
        )
        onUploadError?.(error || 'Error desconocido')
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function removeFile(id: string) {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={e => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed p-4 text-center transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          onChange={e => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          accept=".jpg,.jpeg,.png,.heic,.webp,.gif,.pdf"
        />

        <div className="flex flex-col items-center gap-1">
          <div className="rounded-lg bg-neutral-100 p-2">
            <Upload className="h-4 w-4 text-neutral-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-900">{label}</p>
            <p className="text-xs text-neutral-500">Arrastra o haz clic</p>
          </div>
          <p className="text-xs text-neutral-400">JPG, PNG, HEIC, PDF · Max 10MB</p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="absolute right-4 top-4"
        >
          Seleccionar
        </Button>
      </div>

      {/* Archivos subidos */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-neutral-700">Archivos ({files.length})</p>
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3"
            >
              {file.status === 'success' && file.message === undefined && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              )}
              {file.status === 'success' && file.message === 'Subiendo...' && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600" />
              )}
              {file.status === 'error' && (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900" title={file.name}>{truncateFilename(file.name, 35)}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  {file.size_kb > 0 && <span>{(file.size_kb / 1024).toFixed(1)} MB</span>}
                  {file.message && <span className={file.status === 'error' ? 'text-red-600' : ''}>{file.message}</span>}
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file.id)}
                className="h-8 w-8 p-0 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
