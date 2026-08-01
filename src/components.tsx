import React from 'react'

export interface ToastMsg {
  id: number
  text: string
  type: 'success' | 'error' | 'info'
}

export function ToastContainer({ toasts }: { toasts: ToastMsg[] }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.text}</div>
      ))}
    </div>
  )
}
