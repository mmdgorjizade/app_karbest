import { useState } from 'react';
import { ChevronRight, Save, ExternalLink, Calendar, User, AlertTriangle, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Reel, Page } from '../../data/store';
import Card from '../common/Card';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Input, Textarea, Select } from '../common/Input';

interface Props {
  reel: Reel;
  page: Page;
  onBack: () => void;
}

export default function ReelDetail({ reel: initialReel, page, onBack }: Props) {
  const { currentUser, updateReel, addNotification } = useApp();
  const [reel, setReel] = useState<Reel>(initialReel);
  const [editing, setEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<'scenario' | 'filming' | 'editing' | 'upload' | 'analytics'>('scenario');

  const isManager = currentUser?.role === 'manager';
  const isScriptwriter = currentUser?.role === 'scriptwriter';
  const isCameraman = currentUser?.role === 'cameraman';
  const isEditor = currentUser?.role === 'editor';
  const isAdmin = currentUser?.role === 'admin';
  const isClient = currentUser?.role === 'client';

  const handleSave = () => {
    updateReel(page.id, reel);
    addNotification({
      title: '💾 تغییرات ذخیره شد',
      message: `ریلز ${reel.reelNumber} بروزرسانی شد`,
      type: 'success',
      forRoles: ['manager'],
    });
    setEditing(false);
  };

  const field = (label: string, value: string | number | boolean | undefined, type: 'text' | 'number' | 'textarea' | 'select' = 'text', options?: { value: string; label: string }[], key?: keyof Reel) => {
    const displayVal = value === undefined || value === null || value === '' ? '—' : String(value);

    if (!editing || !key || (!isManager && !isScriptwriter && !isCameraman && !isEditor && !isAdmin)) {
      return (
        <div className="flex items-start justify-between py-2 border-b border-slate-700/50">
          <span className="text-[11px] text-slate-500 flex-shrink-0 w-36">{label}</span>
          <span className="text-[11px] text-white text-left flex-1">{displayVal}</span>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="py-2 border-b border-slate-700/50">
          <Textarea label={label} value={String(value || '')} onChange={e => setReel({ ...reel, [key]: e.target.value })} rows={3} />
        </div>
      );
    }
    if (type === 'select' && options) {
      return (
        <div className="py-2 border-b border-slate-700/50">
          <Select label={label} value={String(value || '')} onChange={e => setReel({ ...reel, [key]: e.target.value })} options={options} />
        </div>
      );
    }
    return (
      <div className="py-2 border-b border-slate-700/50">
        <Input label={label} type={type} value={String(value || '')} onChange={e => setReel({ ...reel, [key]: type === 'number' ? Number(e.target.value) : e.target.value })} />
      </div>
    );
  };

  const sections = [
    { id: 'scenario', label: '📝 سناریو' },
    { id: 'filming', label: '🎬 فیلمبرداری' },
    { id: 'editing', label: '✂️ تدوین' },
    { id: 'upload', label: '📱 بارگذاری' },
    { id: 'analytics', label: '📊 آمار' },
  ];

  return (
    <div className="p-4 space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
          <ChevronRight size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono bg-slate-700/50 px-1.5 py-0.5 rounded">#{reel.reelNumber}</span>
            <h2 className="text-sm font-black text-white truncate">{reel.title}</h2>
          </div>
          <p className="text-[10px] text-slate-400">{page.name} | {reel.month}</p>
        </div>
        {(isManager || isScriptwriter || isCameraman || isEditor || isAdmin) && (
          <div className="flex gap-1.5">
            {editing ? (
              <>
                <button onClick={handleSave} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors">
                  <Save size={12} /> ذخیره
                </button>
                <button onClick={() => { setReel(initialReel); setEditing(false); }} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs transition-colors">
                  لغو
                </button>
              </>
            ) : isManager && (
              <button onClick={() => setEditing(true)} className="px-3 py-1.5 gradient-bg text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
                ویرایش
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status Overview */}
      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={reel.overallStatus} size="md" />
        <StatusBadge status={reel.priority} size="md" />
        {reel.delayDays > 0 && (
          <span className="text-xs text-red-400 flex items-center gap-1 bg-red-950/40 border border-red-900/40 px-2 py-0.5 rounded-full">
            <AlertTriangle size={10} /> {reel.delayDays} روز تاخیر
          </span>
        )}
        {reel.bottleneck && (
          <span className="text-xs text-orange-400 bg-orange-950/40 border border-orange-900/40 px-2 py-0.5 rounded-full truncate max-w-full">
            🔴 {reel.bottleneck}
          </span>
        )}
      </div>

      {/* Section Nav */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id as typeof activeSection)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${activeSection === s.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Scenario Section */}
      {activeSection === 'scenario' && (
        <Card>
          <h3 className="text-sm font-bold text-white mb-2">سناریو</h3>
          {field('ماه', reel.month, 'text', undefined, 'month')}
          {field('هفته', reel.week, 'text', undefined, 'week')}
          {field('ایده/موضوع', reel.title, 'text', undefined, 'title')}
          {field('عنوان ریلز', reel.reelTitle, 'text', undefined, 'reelTitle')}
          {field('تاریخ انتشار هدف', reel.targetPublishDate, 'text', undefined, 'targetPublishDate')}
          {field('وضعیت سناریو', reel.scenarioStatus, 'select', [
            { value: 'not_started', label: 'شروع نشده' },
            { value: 'in_progress', label: 'در جریان' },
            { value: 'ready', label: 'آماده' },
            { value: 'approved', label: 'تایید شده' },
            { value: 'revision_needed', label: 'نیاز به اصلاح' },
          ], 'scenarioStatus')}
          {field('تاریخ آماده شدن سناریو', reel.scenarioReadyDate, 'text', undefined, 'scenarioReadyDate')}
          {field('متن سناریو', reel.scenarioText, 'textarea', undefined, 'scenarioText')}
          {reel.scenarioRevisions && reel.scenarioRevisions.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] text-slate-500 font-medium">اصلاحیه‌ها:</p>
              {reel.scenarioRevisions.map((rev, i) => (
                <div key={i} className="bg-yellow-950/30 border border-yellow-900/30 rounded p-2 text-[10px] text-yellow-300">
                  {rev.from}: {rev.comment} ({rev.date})
                </div>
              ))}
            </div>
          )}
          {field('مسئول', reel.responsible, 'text', undefined, 'responsible')}
        </Card>
      )}

      {/* Filming Section */}
      {activeSection === 'filming' && (
        <Card>
          <h3 className="text-sm font-bold text-white mb-2">فیلمبرداری</h3>
          {field('زمان ضبط اعلام شد؟', reel.recordingAnnounced ? 'بله' : 'خیر')}
          {field('تاریخ/ساعت ضبط', reel.recordingDateTime, 'text', undefined, 'recordingDateTime')}
          {field('لغو ضبط؟', reel.recordingCancelled ? 'بله' : 'خیر')}
          {field('تعداد لغو', reel.recordingCancelCount)}
          {field('لینک/متن لغو ضبط', reel.recordingCancelLink, 'text', undefined, 'recordingCancelLink')}
          {field('وضعیت فیلمبرداری', reel.filmingStatus, 'select', [
            { value: 'not_started', label: 'شروع نشده' },
            { value: 'in_progress', label: 'در جریان' },
            { value: 'done', label: 'انجام شد' },
            { value: 'cancelled', label: 'لغو شد' },
          ], 'filmingStatus')}
          {field('تاریخ فیلمبرداری', reel.filmingDate, 'text', undefined, 'filmingDate')}
          {field('فایل خام ارسال شد؟', reel.rawFileSent ? '✅ بله' : '❌ خیر')}
          {field('تاریخ ارسال فایل خام', reel.rawFileSentDate, 'text', undefined, 'rawFileSentDate')}
          {reel.rawFileLink && (
            <div className="py-2 border-b border-slate-700/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">لینک فایل خام</span>
              <a href={reel.rawFileLink} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <ExternalLink size={10} /> باز کردن
              </a>
            </div>
          )}
          {field('شماره‌گذاری فایل‌ها درست؟', reel.fileNumberingCorrect ? '✅ بله' : '❌ خیر')}
        </Card>
      )}

      {/* Editing Section */}
      {activeSection === 'editing' && (
        <Card>
          <h3 className="text-sm font-bold text-white mb-2">تدوین</h3>
          {field('اولویت', reel.priority, 'select', [
            { value: 'low', label: 'کم' },
            { value: 'medium', label: 'متوسط' },
            { value: 'high', label: 'بالا' },
            { value: 'urgent', label: 'فوری' },
          ], 'priority')}
          {field('وضعیت تدوین', reel.editingStatus, 'select', [
            { value: 'not_started', label: 'شروع نشده' },
            { value: 'in_progress', label: 'در جریان' },
            { value: 'done', label: 'انجام شد' },
          ], 'editingStatus')}
          {field('ددلاین تدوین', reel.editingDeadline, 'text', undefined, 'editingDeadline')}
          {field('تاریخ تحویل تدوین', reel.editingDeliveryDate, 'text', undefined, 'editingDeliveryDate')}
          {reel.editingOutputLink && (
            <div className="py-2 border-b border-slate-700/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">لینک خروجی تدوین</span>
              <a href={reel.editingOutputLink} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-400 flex items-center gap-1">
                <ExternalLink size={10} /> باز کردن
              </a>
            </div>
          )}
          {field('قیمت تدوین', reel.editingCost ? `${reel.editingCost.toLocaleString()} ت` : '—')}
          {field('تعداد اصلاحیه کارفرما', reel.clientRevisionCount)}
          {field('تایید کارفرما', reel.clientApproved ? '✅ تایید شده' : '❌ تایید نشده')}
          {field('هزینه اضافی اصلاحیه', reel.extraRevisionCost ? `${reel.extraRevisionCost.toLocaleString()} ت` : '—')}
          {field('توضیح هزینه', reel.revisionCostDescription, 'text', undefined, 'revisionCostDescription')}
        </Card>
      )}

      {/* Upload Section */}
      {activeSection === 'upload' && (
        <Card>
          <h3 className="text-sm font-bold text-white mb-2">بارگذاری</h3>
          {field('وضعیت بارگذاری', reel.uploadStatus, 'select', [
            { value: 'not_uploaded', label: 'بارگذاری نشده' },
            { value: 'uploaded', label: 'بارگذاری شده' },
          ], 'uploadStatus')}
          {field('تاریخ بارگذاری', reel.uploadDate, 'text', undefined, 'uploadDate')}
          {reel.postLink && (
            <div className="py-2 border-b border-slate-700/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">لینک پست</span>
              <a href={reel.postLink} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-400 flex items-center gap-1">
                <ExternalLink size={10} /> مشاهده در اینستاگرام
              </a>
            </div>
          )}
          {field('وضعیت کلی', reel.overallStatus, 'select', [
            { value: 'pending_scenario', label: 'انتظار سناریو' },
            { value: 'scenario_ready', label: 'سناریو آماده' },
            { value: 'scenario_approved', label: 'سناریو تایید' },
            { value: 'recording_scheduled', label: 'زمان‌بندی شده' },
            { value: 'recorded', label: 'ضبط شده' },
            { value: 'file_sent', label: 'فایل ارسال شد' },
            { value: 'editing', label: 'در حال تدوین' },
            { value: 'edit_done', label: 'تدوین تمام' },
            { value: 'client_approved', label: 'تایید کارفرما' },
            { value: 'uploaded', label: 'بارگذاری شد' },
            { value: 'cancelled', label: 'لغو شد' },
          ], 'overallStatus')}
          {field('گلوگاه/مشکل', reel.bottleneck, 'text', undefined, 'bottleneck')}
          {field('روزهای تاخیر', reel.delayDays, 'number', undefined, 'delayDays')}
          {field('یادداشت/اقدام بعدی', reel.notes, 'textarea', undefined, 'notes')}
          {field('توضیح فاکتور', reel.invoiceDescription, 'text', undefined, 'invoiceDescription')}
          {field('تاریخ مبنای فاکتور', reel.invoiceDate, 'text', undefined, 'invoiceDate')}
        </Card>
      )}

      {/* Analytics Section */}
      {activeSection === 'analytics' && (
        <Card>
          <h3 className="text-sm font-bold text-white mb-2">آمار و بازخورد</h3>
          {field('تعداد ویو', reel.viewCount, 'number', undefined, 'viewCount')}
          {field('تعداد لایک', reel.likeCount, 'number', undefined, 'likeCount')}
          {field('تعداد کامنت', reel.commentCount, 'number', undefined, 'commentCount')}
          {field('جذب فالوور', reel.followerGain, 'number', undefined, 'followerGain')}
          {field('نرخ جذب فالوور (%)', reel.followerGainRate)}
          {field('امتیاز بازخورد (1-5)', reel.feedbackScore, 'number', undefined, 'feedbackScore')}
          {field('بازخورد ریلز', reel.reelFeedback, 'textarea', undefined, 'reelFeedback')}
          {field('توضیح بازخورد / ایده استراتژی', reel.reelFeedback, 'textarea', undefined, 'reelFeedback')}

          {/* Analytics Cards */}
          {reel.viewCount && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-indigo-950/40 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-indigo-300">{reel.viewCount.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">👁️ ویو</p>
              </div>
              <div className="bg-pink-950/40 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-pink-300">{reel.likeCount?.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">❤️ لایک</p>
              </div>
              <div className="bg-blue-950/40 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-blue-300">{reel.commentCount}</p>
                <p className="text-[10px] text-slate-500">💬 کامنت</p>
              </div>
              <div className="bg-green-950/40 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-green-300">+{reel.followerGain}</p>
                <p className="text-[10px] text-slate-500">👥 فالوور</p>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
