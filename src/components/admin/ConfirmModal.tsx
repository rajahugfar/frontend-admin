import { FiAlertTriangle, FiX } from 'react-icons/fi'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  type = 'warning'
}: ConfirmModalProps) => {
  if (!isOpen) return null

  const typeStyles = {
    danger: 'bg-error/10 text-error',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-blue-500/10 text-blue-500'
  }

  const buttonStyles = {
    danger: 'bg-error hover:bg-error/90',
    warning: 'bg-warning hover:bg-warning/90',
    info: 'bg-blue-500 hover:bg-blue-600'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-admin-border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeStyles[type]}`}>
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-brown-100">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brown-400 hover:text-brown-200 hover:bg-admin-hover rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-brown-300 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-admin-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-admin-hover text-brown-200 hover:bg-admin-border rounded-lg transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium ${buttonStyles[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
