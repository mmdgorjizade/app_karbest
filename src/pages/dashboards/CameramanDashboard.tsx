import { useState } from 'react';
import { Camera, Link, CheckCircle, Clock, AlertTriangle, Hash } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Input, Textarea } from '../../components/common/Input';
import { Reel } from '../../data/store';

export default function CameramanDashboard() {
  const { currentUser, pages, updateReel, addNotification } = useApp();
  const [selectedReel, setSelectedReel] = useState<(Reel & { pageId: string }) | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [fileLink, setFileLink] = useState('');
  const [fileNumberOk, setFileNumberOk] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [activeTab, setActiveTab] = useState<'scheduled' | 'pending' | 'done'>('scheduled');

  if (!currentUser) return null;
  const myPages = pages.filter(p => p.cameramanId === currentUser.id);
  const allReels = myPages.flatMap(p => (p.reels || []).map(r => ({ ...r, pageId: p.id, pageName: p.name })));

  const scheduled = allReels.filter(r => r.recordingAnnounced && r.filmingStatus !== 'done' && !r.recordingCancelled);
  const pendingUpload = allReels.filter(r => r.filmingStatus === 'done' && !r.rawFileSent);
  const done = allReels.filter(r => r.rawFileSent);

  const handleSubmitFile = () => {
    if (!selectedReel || !fileLink.trim()) return;
    const updated: Reel = {
      ...selectedReel,
      rawFileSent: true,
      rawFileSentDate: new Date().toLocaleDateString('fa-IR'),
      rawFileLink: fileLink,
      fileNumberingCorrect: fileNumberOk,
      filmingStatus: 'done',
      filmingDate: new Date().toLocaleDateString('fa-IR'),
      overallStatus: 'file_sent',
    };
    updateReel(selectedReel.pageId, updated);
    addNotification({
      title: '📁 فایل ارسال شد',
      message: `فیلمبردار فایل خام ریلز ${selectedReel.reelNumber} را ارسال کرد`,
      type: 'success',
      forRoles: ['editor', 'manager'],
    });
    setShowUploadModal(false);
    setFileLink('');
    setSelectedReel(null);
  };

  const handleCancelRecording = () => {
    if (!selectedReel || !cancelReason.trim()) return;
    const newCancelCount = (selectedReel.recordingCancelCount || 0) + 1;
    const isPaidCancel = newCancelCount > 2;
    const updated: Reel = {
      ...selectedReel,
      recordingCancelled: true,
      recordingCancelCount: newCancelCount,
      recordingCancelLink: cancelReason,
      filmingStatus: 'cancelled',
      overallStatus: 'cancelled',
      notes: isPaidCancel ? `لغو شماره ${newCancelCount} - این لغو محاسبه هزینه می‌شود` : `لغو شماره ${newCancelCount}`,
    };
    updateReel(selectedReel.pageId, updated);
    addNotification({
      title: isPaidCancel ? '🔴 لغو با هزینه' : '⚠️ لغو ضبط',
      message: isPaidCancel
        ? `ضبط ریلز ${selectedReel.reelNumber} برای ${newCancelCount}مین بار لغو شد - هزینه محاسبه می‌شود`
        : `ضبط ریلز ${selectedReel.reelNumber} لغو شد (${newCancelCount}/2)`,
      type: isPaidCancel ? 'error' : 'warning',
      forRoles: ['manager', 'scriptwriter'],
    });
    setShowCancelModal(false);
    setCancelReason('');
    setSelectedReel(null);
  };

  const confirmFilming = (reel: Reel & { pageId: string }) => {
    const updated: Reel = { ...reel, filmingStatus: 'done', filmingDate: new Date().toLocaleDateString('fa-IR'), overallStatus: 'recorded' };
    updateReel(reel.pageId, updated);
    addNotification({
      title: '🎬 فیلمبرداری تایید شد',
      message: `فیلمبردار ریلز ${reel.reelNumber} را فیلمبرداری کرد`,
      type: 'success',
      forRoles: ['manager'],
    });
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-lg font-black text-gradient">پنل فیلمبردار</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-yellow-950/40 border border-yellow-900/40 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-yellow-300">{scheduled.length}</p>
          <p className="text-[10px] text-yellow-500">زمان‌بندی شده</p>
        </div>
        <div className="bg-orange-950/40 border border-orange-900/40 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-orange-300">{pendingUpload.length}</p>
          <p className="text-[10px] text-orange-500">ارسال فایل</p>
        </div>
        <div className="bg-green-950/40 border border-green-900/40 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-green-300">{done.length}</p>
          <p className="text-[10px] text-green-500">ارسال شده</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl">
        {[
          { id: 'scheduled', label: '📅 زمان‌بندی', count: scheduled.length },
          { id: 'pending', label: '📁 ارسال فایل', count: pendingUpload.length },
          { id: 'done', label: '✅ ارسال شده', count: done.length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab.label}
            {tab.count > 0 && (
              <span className="mr-1 px-1 bg-red-500/70 rounded-full text-[9px]">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Scheduled */}
      {activeTab === 'scheduled' && (
        <div className="space-y-2">
          {scheduled.length === 0 ? (
            <Card className="text-center text-sm text-slate-500">ضبطی زمان‌بندی نشده</Card>
          ) : scheduled.map(reel => (
            <Card key={reel.id} className="!p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-white">ریلز {reel.reelNumber}: {reel.title}</p>
                <StatusBadge status={reel.priority} />
              </div>
              <p className="text-[10px] text-slate-400 mb-1">{reel.pageName}</p>
              {reel.recordingDateTime && (
                <div className="flex items-center gap-1 text-[11px] text-indigo-400 mb-2">
                  <Clock size={10} />
                  زمان ضبط: {reel.recordingDateTime}
                </div>
              )}
              {reel.scenarioText && (
                <div className="bg-slate-700/30 rounded-lg p-2 mb-2">
                  <p className="text-[10px] text-slate-400 line-clamp-2">{reel.scenarioText}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => confirmFilming(reel)} className="flex-1 py-1.5 bg-green-600/40 hover:bg-green-600/60 text-green-300 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-colors">
                  <CheckCircle size={10} /> تایید ضبط
                </button>
                <button onClick={() => { setSelectedReel(reel); setShowCancelModal(true); }}
                  className="flex-1 py-1.5 bg-red-600/40 hover:bg-red-600/60 text-red-300 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-colors">
                  <AlertTriangle size={10} /> لغو ({reel.recordingCancelCount}/2)
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Upload */}
      {activeTab === 'pending' && (
        <div className="space-y-2">
          {pendingUpload.length === 0 ? (
            <Card className="text-center text-sm text-slate-500">همه فایل‌ها ارسال شده‌اند ✅</Card>
          ) : pendingUpload.map(reel => (
            <Card key={reel.id} className="!p-3 border-r-2 border-r-orange-500">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-white">ریلز {reel.reelNumber}: {reel.title}</p>
                <StatusBadge status="recorded" />
              </div>
              <p className="text-[10px] text-slate-400 mb-2">{reel.pageName} | {reel.filmingDate}</p>
              <div className="flex items-center gap-2 mb-2 text-[10px]">
                <Hash size={10} className="text-indigo-400" />
                <span className="text-slate-400">شماره‌گذاری فایل: <strong className="text-white">p2-r{reel.reelNumber}-{new Date().getFullYear()}</strong></span>
              </div>
              <button onClick={() => { setSelectedReel(reel); setShowUploadModal(true); }}
                className="w-full py-1.5 gradient-bg text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:opacity-90 transition-opacity">
                <Link size={12} /> ارسال لینک فایل
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Done */}
      {activeTab === 'done' && (
        <div className="space-y-2">
          {done.length === 0 ? (
            <Card className="text-center text-sm text-slate-500">هیچ فایلی ارسال نشده</Card>
          ) : done.map(reel => (
            <Card key={reel.id} className="!p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-white">ریلز {reel.reelNumber}: {reel.title}</p>
                <StatusBadge status="file_sent" />
              </div>
              <p className="text-[10px] text-slate-400">{reel.pageName} | {reel.rawFileSentDate}</p>
              {reel.rawFileLink && (
                <a href={reel.rawFileLink} target="_blank" rel="noreferrer"
                  className="mt-1 flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300">
                  <Link size={10} /> لینک فایل
                </a>
              )}
              <div className="mt-1 flex items-center gap-1 text-[10px]">
                {reel.fileNumberingCorrect
                  ? <span className="text-green-400 flex items-center gap-1"><CheckCircle size={10} /> شماره‌گذاری صحیح</span>
                  : <span className="text-red-400 flex items-center gap-1"><AlertTriangle size={10} /> شماره‌گذاری نادرست</span>
                }
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => { setShowUploadModal(false); setFileLink(''); }} title="ارسال فایل خام">
        <div className="space-y-4">
          {selectedReel && (
            <div className="bg-slate-700/40 rounded-lg p-3">
              <p className="text-xs font-bold text-white">ریلز {selectedReel.reelNumber}: {selectedReel.title}</p>
              <p className="text-[11px] text-slate-400 mt-1">شماره‌گذاری پیشنهادی: <span className="text-indigo-400 font-mono">p{selectedReel.pageId}-r{selectedReel.reelNumber}</span></p>
            </div>
          )}
          <Input label="لینک فایل در تلگرام یا Drive" value={fileLink} onChange={e => setFileLink(e.target.value)} placeholder="https://t.me/+..." />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFileNumberOk(!fileNumberOk)}
              className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${fileNumberOk ? 'bg-green-600 border-green-600' : 'border-slate-600'}`}
            >
              {fileNumberOk && <CheckCircle size={12} className="text-white" />}
            </button>
            <span className="text-sm text-slate-300">شماره‌گذاری فایل‌ها صحیح است</span>
          </div>
          <button onClick={handleSubmitFile} className="w-full py-2.5 gradient-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            تایید و ارسال
          </button>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={() => { setShowCancelModal(false); setCancelReason(''); }} title="لغو ضبط">
        <div className="space-y-4">
          {selectedReel && (
            <div className={`rounded-xl p-3 ${selectedReel.recordingCancelCount >= 2 ? 'bg-red-950/40 border border-red-800' : 'bg-yellow-950/40 border border-yellow-800'}`}>
              <p className="text-sm font-bold text-white">ریلز {selectedReel.reelNumber}</p>
              <p className="text-xs text-slate-400 mt-1">تعداد لغو قبلی: {selectedReel.recordingCancelCount}/2</p>
              {selectedReel.recordingCancelCount >= 2 && (
                <p className="text-xs text-red-400 mt-1 font-bold">⚠️ این لغو به عنوان جلسه ضبط محاسبه می‌شود!</p>
              )}
            </div>
          )}
          <Textarea label="دلیل لغو / لینک اطلاع‌رسانی" value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} placeholder="دلیل لغو را بنویسید..." />
          <button onClick={handleCancelRecording} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors">
            تایید لغو
          </button>
        </div>
      </Modal>
    </div>
  );
}
