import { useState } from 'react';
import { Film, Link, CheckCircle, DollarSign, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Input } from '../../components/common/Input';
import { Reel } from '../../data/store';

export default function EditorDashboard() {
  const { currentUser, pages, updateReel, addNotification } = useApp();
  const [selectedReel, setSelectedReel] = useState<(Reel & { pageId: string; pageName: string }) | null>(null);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [outputLink, setOutputLink] = useState('');
  const [editingCost, setEditingCost] = useState('');
  const [activeTab, setActiveTab] = useState<'queue' | 'inprogress' | 'done'>('queue');

  if (!currentUser) return null;
  const myPages = pages.filter(p => p.editorId === currentUser.id);
  const allReels = myPages.flatMap(p => (p.reels || []).map(r => ({ ...r, pageId: p.id, pageName: p.name })));

  const queue = allReels
    .filter(r => r.rawFileSent && r.editingStatus === 'not_started')
    .sort((a, b) => {
      const prio = { urgent: 0, high: 1, medium: 2, low: 3 };
      return prio[a.priority] - prio[b.priority];
    });
  const inProgress = allReels.filter(r => r.editingStatus === 'in_progress');
  const done = allReels.filter(r => r.editingStatus === 'done');

  const handleStartEditing = (reel: Reel & { pageId: string }) => {
    const updated: Reel = { ...reel, editingStatus: 'in_progress', overallStatus: 'editing' };
    updateReel(reel.pageId, updated);
    addNotification({
      title: '✂️ تدوین شروع شد',
      message: `تدوینگر ریلز ${reel.reelNumber} را شروع به تدوین کرد`,
      type: 'info',
      forRoles: ['manager'],
    });
  };

  const handleSubmitOutput = () => {
    if (!selectedReel || !outputLink.trim()) return;
    const updated: Reel = {
      ...selectedReel,
      editingStatus: 'done',
      editingDeliveryDate: new Date().toLocaleDateString('fa-IR'),
      editingOutputLink: outputLink,
      editingCost: editingCost ? parseInt(editingCost) : selectedReel.editingCost,
      overallStatus: 'edit_done',
    };
    updateReel(selectedReel.pageId, updated);
    addNotification({
      title: '🎬 تدوین تکمیل شد',
      message: `ریلز ${selectedReel.reelNumber} تدوین شد و آماده بارگذاری است`,
      type: 'success',
      forRoles: ['admin', 'manager', 'client'],
    });
    setShowOutputModal(false);
    setOutputLink('');
    setEditingCost('');
    setSelectedReel(null);
  };

  const priorityColors: Record<string, string> = {
    urgent: 'border-r-red-500',
    high: 'border-r-orange-500',
    medium: 'border-r-blue-500',
    low: 'border-r-slate-600',
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-lg font-black text-gradient">پنل تدوینگر</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-yellow-950/40 border border-yellow-900/40 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-yellow-300">{queue.length}</p>
          <p className="text-[10px] text-yellow-500">صف تدوین</p>
        </div>
        <div className="bg-purple-950/40 border border-purple-900/40 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-purple-300">{inProgress.length}</p>
          <p className="text-[10px] text-purple-500">در حال تدوین</p>
        </div>
        <div className="bg-green-950/40 border border-green-900/40 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-green-300">{done.length}</p>
          <p className="text-[10px] text-green-500">تکمیل شده</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl">
        {[
          { id: 'queue', label: '📋 صف', count: queue.length },
          { id: 'inprogress', label: '✂️ در جریان', count: inProgress.length },
          { id: 'done', label: '✅ تمام شده', count: done.length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab.label}
            {tab.count > 0 && tab.id !== 'done' && (
              <span className="mr-1 px-1 bg-red-500/70 rounded-full text-[9px]">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-2">
          {queue.length === 0 ? (
            <Card className="text-center text-sm text-slate-500">صف تدوین خالی است ✅</Card>
          ) : queue.map(reel => (
            <Card key={reel.id} className={`!p-3 border-r-2 ${priorityColors[reel.priority]}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={reel.priority} />
                  <p className="text-xs font-bold text-white">ریلز {reel.reelNumber}</p>
                </div>
                {reel.editingDeadline && (
                  <span className="text-[10px] text-red-400 flex items-center gap-1">
                    <AlertTriangle size={9} /> ددلاین: {reel.editingDeadline}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mb-1">{reel.reelTitle || reel.title}</p>
              <p className="text-[10px] text-slate-500 mb-2">{reel.pageName}</p>
              {reel.scenarioText && (
                <div className="bg-slate-700/30 rounded p-2 mb-2">
                  <p className="text-[10px] text-slate-400 line-clamp-2">{reel.scenarioText}</p>
                </div>
              )}
              {reel.rawFileLink && (
                <a href={reel.rawFileLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 mb-2">
                  <Link size={10} /> لینک فایل خام
                </a>
              )}
              <button onClick={() => handleStartEditing(reel)}
                className="w-full py-1.5 gradient-bg text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:opacity-90 transition-opacity">
                <Film size={12} /> شروع تدوین
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* In Progress */}
      {activeTab === 'inprogress' && (
        <div className="space-y-2">
          {inProgress.length === 0 ? (
            <Card className="text-center text-sm text-slate-500">هیچ تدوینی در جریان نیست</Card>
          ) : inProgress.map(reel => (
            <Card key={reel.id} className="!p-3 border-r-2 border-r-purple-500">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-white">ریلز {reel.reelNumber}: {reel.title}</p>
                <StatusBadge status="editing" />
              </div>
              <p className="text-[10px] text-slate-400 mb-2">{reel.pageName}</p>
              {reel.rawFileLink && (
                <a href={reel.rawFileLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 mb-2">
                  <Link size={10} /> فایل خام
                </a>
              )}
              <button onClick={() => { setSelectedReel(reel); setShowOutputModal(true); }}
                className="w-full py-1.5 bg-green-600/40 hover:bg-green-600/60 text-green-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                <CheckCircle size={12} /> تدوین تمام شد - آپلود خروجی
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Done */}
      {activeTab === 'done' && (
        <div className="space-y-2">
          {done.length === 0 ? (
            <Card className="text-center text-sm text-slate-500">هیچ تدوینی تکمیل نشده</Card>
          ) : done.map(reel => (
            <Card key={reel.id} className="!p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-white">ریلز {reel.reelNumber}: {reel.title}</p>
                <StatusBadge status="edit_done" />
              </div>
              <p className="text-[10px] text-slate-400 mb-1">{reel.pageName} | {reel.editingDeliveryDate}</p>
              {reel.editingCost && (
                <p className="text-[11px] text-green-400 flex items-center gap-1 mb-1">
                  <DollarSign size={10} /> قیمت: {reel.editingCost.toLocaleString()} تومان
                </p>
              )}
              {reel.editingOutputLink && (
                <a href={reel.editingOutputLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300">
                  <Link size={10} /> لینک خروجی
                </a>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Output Modal */}
      <Modal isOpen={showOutputModal} onClose={() => { setShowOutputModal(false); setOutputLink(''); }} title="آپلود خروجی تدوین">
        <div className="space-y-4">
          {selectedReel && (
            <div className="bg-slate-700/40 rounded-lg p-3">
              <p className="text-xs font-bold text-white">ریلز {selectedReel.reelNumber}: {selectedReel.title}</p>
              <p className="text-[11px] text-slate-400 mt-1">{selectedReel.pageName}</p>
            </div>
          )}
          <Input label="لینک خروجی تدوین" value={outputLink} onChange={e => setOutputLink(e.target.value)} placeholder="https://drive.google.com/..." />
          <Input label="قیمت تدوین (تومان)" type="number" value={editingCost} onChange={e => setEditingCost(e.target.value)} placeholder="500000" />
          <button onClick={handleSubmitOutput} className="w-full py-2.5 gradient-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            تایید و ارسال
          </button>
        </div>
      </Modal>
    </div>
  );
}
