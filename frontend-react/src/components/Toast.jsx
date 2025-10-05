import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-500'
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-500'
    },
    info: {
      icon: AlertCircle,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-500'
    }
  };

  const { icon: Icon, bg, border, text, iconColor } = config[type];

  return (
    <div className={`fixed top-4 right-4 z-50 ${bg} ${border} border ${text} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in`}>
      <Icon className={iconColor} size={20} />
      <p className="flex-1 font-medium">{message}</p>
      <button onClick={onClose} className="hover:opacity-70">
        <X size={16} />
      </button>
    </div>
  );
}