'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/file-uploader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UploadedFile {
  bucket: string
  url: string
  filename: string
  size_kb: number
  uploadedAt: string
}

export default function TestUploadPage() {
  const [uploads, setUploads] = useState<UploadedFile[]>([])
  const [bucket, setBucket] = useState<'examenes' | 'notas-clinicas' | 'fotos-antropometria' | 'fotos-bioimpedancia'>('examenes')

  const handleSuccess = (result: { url: string; filename: string; size_kb: number }) => {
    setUploads(prev => [
      {
        bucket,
        url: result.url,
        filename: result.filename,
        size_kb: result.size_kb,
        uploadedAt: new Date().toLocaleString('es-CL'),
      },
      ...prev,
    ])
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Test: File Uploader</h1>
          <p className="text-neutral-600">Prueba subir archivos a Supabase Storage</p>
        </div>

        {/* Selector de bucket */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Selecciona bucket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {(['examenes', 'notas-clinicas', 'fotos-antropometria', 'fotos-bioimpedancia'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBucket(b)}
                  className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                    bucket === b
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* File Uploader */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Subir archivo a: <span className="text-emerald-600">{bucket}</span></CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploader
              bucket={bucket}
              label={`Subir a ${bucket}`}
              onUploadSuccess={handleSuccess}
              onUploadError={(error) => alert('Error: ' + error)}
              multiple={true}
              maxFiles={10}
            />
          </CardContent>
        </Card>

        {/* Historial de uploads */}
        {uploads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Archivos subidos ({uploads.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {uploads.map((file, idx) => (
                <div key={idx} className="border border-neutral-200 rounded-lg p-3 bg-neutral-50">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-neutral-900 break-all">{file.filename}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {file.bucket} · {file.size_kb} KB · {file.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-600">URL:</p>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline break-all block"
                    >
                      {file.url}
                    </a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
