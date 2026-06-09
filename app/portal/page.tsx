'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { portalSessionStorage } from '@/lib/storage'

export default function PortalRoot() {
  const router = useRouter()
  useEffect(() => {
    const s = portalSessionStorage.get()
    router.replace(s ? '/portal/dashboard' : '/portal/login')
  }, [router])
  return null
}
