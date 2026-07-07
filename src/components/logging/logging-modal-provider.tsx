'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { LoggingModal } from './logging-modal'

interface LoggingModalContextValue {
  open: (albumId?: string) => void
}

const LoggingModalContext = createContext<LoggingModalContextValue | null>(null)

export function useLoggingModal(): LoggingModalContextValue {
  const ctx = useContext(LoggingModalContext)
  if (!ctx) throw new Error('useLoggingModal must be used within LoggingModalProvider')
  return ctx
}

export function LoggingModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialAlbumId, setInitialAlbumId] = useState<string | undefined>(undefined)

  const open = useCallback((albumId?: string) => {
    setInitialAlbumId(albumId)
    setIsOpen(true)
  }, [])

  return (
    <LoggingModalContext.Provider value={{ open }}>
      {children}
      <LoggingModal open={isOpen} onOpenChange={setIsOpen} initialAlbumId={initialAlbumId} />
    </LoggingModalContext.Provider>
  )
}
