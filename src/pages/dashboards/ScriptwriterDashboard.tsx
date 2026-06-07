import { useState } from 'react';
import { PenLine, CheckCircle, AlertCircle, Send, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Reel } from '../../data/store';

export default function ScriptwriterDashboard() {
  const { currentUser, pages, updateReel, addNotification } = useApp();
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [scenarioText, setScenarioText] = useState('');
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'todos' | 'scenarios' | 'feedback'>('todos');

  if (!currentUser) return null;

  const myPages = pages.filter(p => p.scriptwriterId === currentUser.id);
  const allReels = myPages.flatMap(p => (p.reels || []).map(r => ({ ...r, pageName: p.name, pageId: p.id })));

  const pendingScenarios = allReels.filter(r => r.scenarioStatus === 'not_started' || r.scenarioStatus === 'in_progress');
  const revisionNeeded = allReels.filter(r => r.scenarioStatus === 'revision_needed');
  const done = allReels.filter(r => r.scenarioStatus === 'approved' || r.scenarioStatus === 'ready');

  const openScenarioModal = (reel: Reel & { pageId: string }, isEdit = false) => {
    setSelectedReel(reel);
    setSelectedPageId(reel.pageId);
    setScenarioText(isEdit ? (reel.scenarioText || '') : '');
    setScenarioTitle(reel.reelTitle || reel.title || '');
    setShowScenarioModal(true);
  };

  const handleSubmitScenario = () => {
    if (!selectedReel || !scenarioText.trim()) return;
    const updated: Reel = {
      ...selectedReel,
      scenarioText,
      reelTitle: scenarioTitle,
      scenarioStatus: 'ready',
      scenarioReadyDate: new Date().toLocaleDateString('fa-IR'),
    };
    updateReel(selectedPageId, updated);
    addNotification({
      title: '📝 سناریو آماده شد',
      message: `سناریو ریلز ${selectedReel.reelNumber} آماده بررسی است`,
      type: 'success',
      forRoles: ['manager', 'client', 'cameraman'],
    });
    setShowScenarioModal(false);
    setScenarioText('');
    setSelectedReel(null);
  };

  const handleMarkFilmingReported = (reel: Reel & { pageId: string }) => {
    const updated: Reel = { ...reel, filmingWithoutScenarioWriter: true };
    updateReel(reel.pageId, updated);
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-lg font-black text-gradient">پنل سناریونویس</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-yellow-950/40 border border-yellow-900/40 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-yellow-300">{pendingScenarios.length}</p>
          <p className="text-[10px] text-yellow-500">در انتظار</p>
        </div>
        <div className="bg-orange-950/40 border border-orange-900/40 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-orange-300">{revisionNeeded.length}</p>
          <p className="text-[10px] text-orange-500">نیاز به اصلاح</p>
        </div>
        <div className="bg-green-950/40 border border-green-900/40 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-green-300">{done.length}</p>
          <p className="text-[10px] text-green-500">تکمیل شده</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl">
        {[
          { id: 'todos', label: 'وظایف', count: pendingScenarios.length + revisionNeeded.length },
          { id: 'scenarios', label: 'همه سناریوها', count: allReels.length },
          { id: 'feedback', label: 'بازخوردها', count: revisionNeeded.length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all relative ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab.label}
            {tab.count > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Todos Tab */}
      {activeTab === 'todos' && (
        <div className="space-y-3">
          {revisionNeeded.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-orange-400 mb-2 flex items-center gap-1"><AlertCircle size={12} /> نیاز به اصلاح ({revisionNeeded.length})</h3>
              {revisionNeeded.map(reel => (
                <ReelCard key={reel.id} reel={reel} onEdit={() => openScenarioModal(reel, true)} isRevision />
              ))}
            </div>
          )}
          {pendingScenarios.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-yellow-400 mb-2 flex items-center gap-1"><PenLine size={12} /> در انتظار نوشتن ({pendingScenarios.length})</h3>
              {pendingScenarios.map(reel => (
                <ReelCard key={reel.id} reel={reel} onWrite={() => openScenarioModal(reel, false)} />
              ))}
            </div>
          )}
          {pendingScenarios.length === 0 && revisionNeeded.length === 0 && (
            <Card className="text-center text-sm text-green-400">
              <CheckCircle size={20} className="mx-auto mb-2" />
              همه سناریوها تکمیل شده‌اند! 🎉
            </Card>
          )}
        </div>
      )}

      {/* All Scenarios Tab */}
      {activeTab === 'scenarios' && (
        <div className="space-y-2">
          {myPages.map(page => (
            <div key={page.id}>
              <h3 className="text-xs font-bold text-white mb-2">📱 {page.name}</h3>
              {(page.reels || []).map(reel => {
                const r = { ...reel, pageId: page.id, pageName: page.name };
                return (
                  <Card key={reel.id} className="mb-2 !p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-white">ریلز {reel.reelNumber}: {reel.title}</p>
                      <StatusBadge status={reel.scenarioStatus} />
                    </div>
                    {reel.scenarioText && <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">{reel.scenarioText}</p>}
                    <div className="flex gap-2">
                      {(reel.scenarioStatus === 'not_started' || reel.scenarioStatus === 'in_progress') && (
                        <button onClick={() => openScenarioModal(r, false)} className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-medium flex items-center justify-center gap-1">
                          <PenLine size={10} /> بنویس
                        </button>
                      )}
                      {(reel.scenarioStatus === 'revision_needed' || reel.scenarioStatus === 'ready') && (
                        <button onClick={() => openScenarioModal(r, true)} className="flex-1 py-1 bg-yellow-600/40 hover:bg-yellow-600/60 text-yellow-300 rounded text-[10px] font-medium flex items-center justify-center gap-1">
                          <PenLine size={10} /> ویرایش
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="space-y-2">
          {revisionNeeded.length === 0 ? (
            <Card className="text-center text-sm text-slate-500">هیچ اصلاحیه‌ای وجود ندارد</Card>
          ) : revisionNeeded.map(reel => (
            <Card key={reel.id} className="border-r-2 border-r-orange-500">
              <p className="text-xs font-bold text-white mb-2">ریلز {reel.reelNumber}: {reel.title} | {reel.pageName}</p>
              {reel.scenarioRevisions?.map((rev, i) => (
                <div key={i} className="bg-orange-950/30 border border-orange-900/30 rounded-lg p-2 mb-2">
                  <p className="text-[11px] text-orange-300"><span className="font-bold">{rev.from}:</span> {rev.comment}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{rev.date}</p>
                </div>
              ))}
              <button onClick={() => openScenarioModal(reel, true)} className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors">
                <PenLine size={12} /> ویرایش سناریو
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Scenario Write/Edit Modal */}
      <Modal isOpen={showScenarioModal} onClose={() => setShowScenarioModal(false)} title={selectedReel ? `سناریو ریلز ${selectedReel.reelNumber}` : 'سناریو'} size="lg">
        <div className="space-y-4">
          {selectedReel?.scenarioRevisions && selectedReel.scenarioRevisions.length > 0 && (
            <div className="bg-orange-950/30 border border-orange-800/40 rounded-xl p-3">
              <p className="text-xs font-bold text-orange-400 mb-2">اصلاحیه‌های کارفرما:</p>
              {selectedReel.scenarioRevisions.map((rev, i) => (
                <p key={i} className="text-xs text-orange-300">{rev.from}: {rev.comment}</p>
              ))}
            </div>
          )}
          <Input label="تیتر/عنوان ریلز" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} placeholder="عنوان جذاب ریلز..." />
          <Textarea label="متن سناریو" value={scenarioText} onChange={e => setScenarioText(e.target.value)} rows={8} placeholder="سناریو کامل ریلز را بنویسید..." />
          <button onClick={handleSubmitScenario} className="w-full py-2.5 gradient-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Send size={16} /> ارسال سناریو
          </button>
        </div>
      </Modal>
    </div>
  );
}

function ReelCard({ reel, onWrite, onEdit, isRevision }: {
  reel: Reel & { pageName?: string; pageId: string };
  onWrite?: () => void;
  onEdit?: () => void;
  isRevision?: boolean;
}) {
  return (
    <Card className={`mb-2 !p-3 border-r-2 ${isRevision ? 'border-r-orange-500' : 'border-r-yellow-500'}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-white">ریلز {reel.reelNumber}: {reel.title}</p>
        <StatusBadge status={reel.scenarioStatus} />
      </div>
      <p className="text-[10px] text-slate-500 mb-2">{reel.pageName} | هدف انتشار: {reel.targetPublishDate}</p>
      <div className="flex gap-2">
        {onWrite && (
          <button onClick={onWrite} className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors">
            <PenLine size={12} /> بنویس
          </button>
        )}
        {onEdit && (
          <button onClick={onEdit} className="flex-1 py-1.5 bg-yellow-600/40 hover:bg-yellow-600/60 text-yellow-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors">
            <PenLine size={12} /> ویرایش
          </button>
        )}
      </div>
    </Card>
  );
}
