import { useState } from 'react'
import { storageClient } from '@/lib/storage-client'

interface FileUploadState {
  uploading: boolean
  error: string | null
}

export function useFileUpload(bucket: string) {
  const [state, setState] = useState<FileUploadState>({ uploading: false, error: null })

  async function upload(file: File) {
    setState({ uploading: true, error: null })
    const result = await storageClient.upload(bucket, file)

    if (!result.success) {
      setState({ uploading: false, error: result.error || 'Error desconocido' })
      return null
    }

    setState({ uploading: false, error: null })
    return result
  }

  async function remove(filename: string) {
    setState({ uploading: true, error: null })
    const result = await storageClient.delete(bucket, filename)

    if (!result.success) {
      setState({ uploading: false, error: result.error || 'Error desconocido' })
      return false
    }

    setState({ uploading: false, error: null })
    return true
  }

  return { upload, remove, uploading: state.uploading, error: state.error }
}
