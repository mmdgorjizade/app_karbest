interface Props {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ children, className = '', onClick, hover = false }: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
