import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: Props) {
  if (!isOpen) return null;

  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeMap[size]} bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
