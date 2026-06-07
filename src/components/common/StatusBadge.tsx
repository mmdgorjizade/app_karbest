

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

const statusMap: Record<string, { label: string; color: string; dot: string }> = {
  // Reel Overall Status
  pending_scenario: { label: 'انتظار سناریو', color: 'bg-gray-800 text-gray-300 border border-gray-700', dot: 'bg-gray-400' },
  scenario_ready: { label: 'سناریو آماده', color: 'bg-blue-900/60 text-blue-300 border border-blue-800', dot: 'bg-blue-400' },
  scenario_approved: { label: 'سناریو تایید', color: 'bg-indigo-900/60 text-indigo-300 border border-indigo-800', dot: 'bg-indigo-400' },
  recording_scheduled: { label: 'ضبط زمان‌بندی شد', color: 'bg-yellow-900/60 text-yellow-300 border border-yellow-800', dot: 'bg-yellow-400' },
  recorded: { label: 'ضبط شد', color: 'bg-orange-900/60 text-orange-300 border border-orange-800', dot: 'bg-orange-400' },
  file_sent: { label: 'فایل ارسال شد', color: 'bg-cyan-900/60 text-cyan-300 border border-cyan-800', dot: 'bg-cyan-400' },
  editing: { label: 'در حال تدوین', color: 'bg-purple-900/60 text-purple-300 border border-purple-800', dot: 'bg-purple-400' },
  edit_done: { label: 'تدوین تمام', color: 'bg-teal-900/60 text-teal-300 border border-teal-800', dot: 'bg-teal-400' },
  client_approved: { label: 'تایید کارفرما', color: 'bg-green-900/60 text-green-300 border border-green-800', dot: 'bg-green-400' },
  uploaded: { label: '✅ بارگذاری شد', color: 'bg-green-900/80 text-green-200 border border-green-700', dot: 'bg-green-300' },
  cancelled: { label: 'لغو شد', color: 'bg-red-900/60 text-red-300 border border-red-800', dot: 'bg-red-400' },
  // Scenario Status
  not_started: { label: 'شروع نشده', color: 'bg-gray-800 text-gray-400 border border-gray-700', dot: 'bg-gray-500' },
  in_progress: { label: 'در جریان', color: 'bg-blue-900/60 text-blue-300 border border-blue-800', dot: 'bg-blue-400' },
  ready: { label: 'آماده', color: 'bg-teal-900/60 text-teal-300 border border-teal-800', dot: 'bg-teal-400' },
  approved: { label: '✅ تایید شده', color: 'bg-green-900/60 text-green-300 border border-green-700', dot: 'bg-green-400' },
  revision_needed: { label: '⚠️ نیاز به اصلاح', color: 'bg-yellow-900/60 text-yellow-300 border border-yellow-800', dot: 'bg-yellow-400' },
  done: { label: '✅ انجام شد', color: 'bg-green-900/60 text-green-300 border border-green-700', dot: 'bg-green-400' },
  not_uploaded: { label: 'بارگذاری نشده', color: 'bg-gray-800 text-gray-400 border border-gray-700', dot: 'bg-gray-500' },
  // Priority
  low: { label: 'کم', color: 'bg-gray-800 text-gray-300 border border-gray-700', dot: 'bg-gray-400' },
  medium: { label: 'متوسط', color: 'bg-blue-900/60 text-blue-300 border border-blue-700', dot: 'bg-blue-400' },
  high: { label: 'بالا', color: 'bg-orange-900/60 text-orange-300 border border-orange-700', dot: 'bg-orange-400' },
  urgent: { label: '🔴 فوری', color: 'bg-red-900/70 text-red-200 border border-red-700', dot: 'bg-red-400' },
};

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const info = statusMap[status] || { label: status, color: 'bg-gray-800 text-gray-300 border border-gray-700', dot: 'bg-gray-500' };
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${info.color} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  );
}
