'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from 'react'
import { CheckCircle2, XCircle, Info, AlertCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdCounterRef = useRef(0)

  const showToast = useCallback((type: ToastType, message: string, duration: number = 4000) => {
    // Use a counter-based ID instead of Math.random() to avoid hydration mismatches
    toastIdCounterRef.current += 1
    const id = `toast-${toastIdCounterRef.current}-${Date.now()}`
    const newToast: Toast = { id, type, message, duration }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const value: ToastContextType = {
    showToast,
    success: (message, duration) => showToast('success', message, duration),
    error: (message, duration) => showToast('error', message, duration),
    info: (message, duration) => showToast('info', message, duration),
    warning: (message, duration) => showToast('warning', message, duration),
  }

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5" style={{ color: '#22C55E' }} />
      case 'error':
        return <XCircle className="w-5 h-5" style={{ color: '#EF4444' }} />
      case 'warning':
        return <AlertCircle className="w-5 h-5" style={{ color: '#F59E0B' }} />
      case 'info':
        return <Info className="w-5 h-5" style={{ color: '#3B82F6' }} />
    }
  }

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          background: 'rgba(34, 197, 94, 0.1)',
          borderColor: '#22C55E',
          color: '#22C55E',
        }
      case 'error':
        return {
          background: 'rgba(239, 68, 68, 0.1)',
          borderColor: '#EF4444',
          color: '#EF4444',
        }
      case 'warning':
        return {
          background: 'rgba(245, 158, 11, 0.1)',
          borderColor: '#F59E0B',
          color: '#F59E0B',
        }
      case 'info':
        return {
          background: 'rgba(59, 130, 246, 0.1)',
          borderColor: '#3B82F6',
          color: '#3B82F6',
        }
    }
  }

  // Only render toasts on client side to avoid hydration mismatches
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {isMounted && (
        <div
          suppressHydrationWarning
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            pointerEvents: 'none',
          }}
        >
        {toasts.map((toast) => {
          const style = getToastStyle(toast.type)
          return (
            <div
              key={toast.id}
              className="glass-card"
              style={{
                minWidth: 300,
                maxWidth: 400,
                padding: '16px',
                border: `2px solid ${style.borderColor}`,
                background: style.background,
                color: style.color,
                pointerEvents: 'auto',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transform: 'translateX(0)',
                opacity: 1,
                transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
              }}
            >
              <div className="flex items-start gap-3">
                {getToastIcon(toast.type)}
                <p className="flex-1 text-sm font-medium">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: style.color }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      ` }} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

