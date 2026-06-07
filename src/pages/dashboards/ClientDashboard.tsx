import { useState } from 'react';
import { Eye, ThumbsUp, Users, Star, MessageSquare, Edit3, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Textarea } from '../../components/common/Input';
import { Reel } from '../../data/store';

export default function ClientDashboard() {
  const { currentUser, pages, updateReel, addNotification } = useApp();
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [showRevision, setShowRevision] = useState(false);
  const [revisionComment, setRevisionComment] = useState('');
  const [activeTab, setActiveTab] = useState<'scenarios' | 'reels' | 'stats'>('reels');

  if (!currentUser) return null;

  const myPages = pages.filter(p => p.clientId === currentUser.id);
  const allMyReels = myPages.flatMap(p => p.reels || []);

  const uploaded = allMyReels.filter(r => r.overallStatus === 'uploaded').length;
  const totalViews = allMyReels.reduce((s, r) => s + (r.viewCount || 0), 0);
  const totalFollowers = allMyReels.reduce((s, r) => s + (r.followerGain || 0), 0);
  const totalLikes = allMyReels.reduce((s, r) => s + (r.likeCount || 0), 0);

  const handleRevisionSubmit = (reel: Reel, pageId: string) => {
    if (!revisionComment.trim()) return;
    const updated: Reel = {
      ...reel,
      scenarioStatus: 'revision_needed',
      scenarioRevisions: [
        ...(reel.scenarioRevisions || []),
        { date: new Date().toLocaleDateString('fa-IR'), comment: revisionComment, from: currentUser.name },
      ],
      clientRevisionCount: reel.clientRevisionCount + 1,
    };
    updateReel(pageId, updated);
    addNotification({
      title: '📝 اصلاحیه سناریو',
      message: `${currentUser.name} اصلاحیه برای ریلز ${reel.reelNumber} ارسال کرد: ${revisionComment.slice(0, 50)}...`,
      type: 'warning',
      forRoles: ['scriptwriter', 'manager'],
    });
    setRevisionComment('');
    setShowRevision(false);
    setSelectedReel(null);
  };

  const handleApprove = (reel: Reel, pageId: string) => {
    const updated: Reel = { ...reel, clientApproved: true, scenarioStatus: 'approved' };
    updateReel(pageId, updated);
    addNotification({
      title: '✅ سناریو تایید شد',
      message: `${currentUser.name} سناریو ریلز ${reel.reelNumber} را تایید کرد`,
      type: 'success',
      forRoles: ['scriptwriter', 'manager', 'cameraman'],
    });
  };

  const setPriority = (reel: Reel, pageId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    updateReel(pageId, { ...reel, priority });
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-lg font-black text-gradient">پنل کارفرما</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<CheckCircle size={16} />} label="ریلز بارگذاری" value={uploaded} color="green" />
        <StatCard icon={<Eye size={16} />} label="کل ویوها" value={`${(totalViews/1000).toFixed(1)}K`} color="purple" />
        <StatCard icon={<Users size={16} />} label="فالوور جذب" value={totalFollowers} color="blue" />
        <StatCard icon={<ThumbsUp size={16} />} label="کل لایک" value={totalLikes.toLocaleString()} color="pink" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl">
        {[
          { id: 'reels', label: 'ریلزها' },
          { id: 'scenarios', label: 'سناریوها' },
          { id: 'stats', label: 'آمار پیج' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reels Tab */}
      {activeTab === 'reels' && (
        <div className="space-y-3">
          {myPages.map(page => (
            <div key={page.id}>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                📱 {page.name}
                <span className="text-xs text-slate-500">{page.instagramHandle}</span>
              </h3>
              <div className="space-y-2">
                {(page.reels || []).map(reel => (
                  <Card key={reel.id} hover onClick={() => setSelectedReel(reel)} className="!p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-bold text-white">ریلز {reel.reelNumber}: {reel.title}</p>
                      <StatusBadge status={reel.overallStatus} />
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">{reel.reelTitle}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">اولویت:</span>
                        <StatusBadge status={reel.priority} />
                      </div>
                      {reel.delayDays > 0 && (
                        <span className="text-[10px] text-red-400">⚠️ {reel.delayDays} روز تاخیر</span>
                      )}
                    </div>
                    {/* Priority Buttons */}
                    <div className="flex gap-1 mt-2">
                      {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
                        <button
                          key={p}
                          onClick={e => { e.stopPropagation(); setPriority(reel, page.id, p); }}
                          className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${reel.priority === p ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                        >
                          {p === 'low' ? 'کم' : p === 'medium' ? 'متوسط' : p === 'high' ? 'بالا' : 'فوری'}
                        </button>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scenarios Tab */}
      {activeTab === 'scenarios' && (
        <div className="space-y-3">
          {myPages.map(page => (
            <div key={page.id}>
              <h3 className="text-sm font-bold text-white mb-2">📱 {page.name}</h3>
              {(page.reels || []).filter(r => r.scenarioText).map(reel => (
                <Card key={reel.id} className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-white">ریلز {reel.reelNumber}: {reel.title}</p>
                    <StatusBadge status={reel.scenarioStatus} />
                  </div>
                  {reel.scenarioText && (
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2 bg-slate-700/30 rounded-lg p-2">
                      {reel.scenarioText}
                    </p>
                  )}
                  {reel.scenarioRevisions && reel.scenarioRevisions.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {reel.scenarioRevisions.map((rev, i) => (
                        <div key={i} className="text-[10px] bg-yellow-900/20 border border-yellow-800/30 rounded p-2">
                          <span className="text-yellow-400">{rev.from}:</span> {rev.comment}
                        </div>
                      ))}
                    </div>
                  )}
                  {reel.scenarioStatus !== 'approved' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(reel, page.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-700/40 hover:bg-green-700/60 text-green-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        <CheckCircle size={12} /> تایید
                      </button>
                      <button
                        onClick={() => { setSelectedReel(reel); setShowRevision(true); }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-yellow-700/40 hover:bg-yellow-700/60 text-yellow-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Edit3 size={12} /> اصلاحیه
                      </button>
                    </div>
                  )}
                  {reel.scenarioStatus === 'approved' && (
                    <p className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12} /> سناریو تایید شده</p>
                  )}
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-3">
          {myPages.map(page => {
            const pageReels = page.reels || [];
            const uploadedR = pageReels.filter(r => r.overallStatus === 'uploaded');
            const totalV = uploadedR.reduce((s, r) => s + (r.viewCount || 0), 0);
            const totalF = uploadedR.reduce((s, r) => s + (r.followerGain || 0), 0);
            const contract = page.contract;
            return (
              <Card key={page.id}>
                <h3 className="text-sm font-bold text-white mb-3">📱 {page.name} | {page.instagramHandle}</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-700/40 rounded-lg p-2 text-center">
                    <p className="text-lg font-black text-white">{uploadedR.length}</p>
                    <p className="text-[10px] text-slate-400">ریلز بارگذاری</p>
                  </div>
                  <div className="bg-slate-700/40 rounded-lg p-2 text-center">
                    <p className="text-lg font-black text-white">{(totalV/1000).toFixed(1)}K</p>
                    <p className="text-[10px] text-slate-400">کل ویو</p>
                  </div>
                  <div className="bg-slate-700/40 rounded-lg p-2 text-center">
                    <p className="text-lg font-black text-white">{totalF}</p>
                    <p className="text-[10px] text-slate-400">فالوور جذب</p>
                  </div>
                </div>
                {contract && (
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>هدف ماهانه: {contract.monthlyReelsCount} ریلز</p>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (uploadedR.length / contract.monthlyReelsCount) * 100)}%` }} />
                    </div>
                    <p className="text-center">{Math.round((uploadedR.length / contract.monthlyReelsCount) * 100)}% از هدف ماهانه</p>
                  </div>
                )}
                {uploadedR.map(r => (
                  <div key={r.id} className="mt-2 flex items-center justify-between p-2 bg-slate-700/20 rounded-lg">
                    <p className="text-xs text-white">ریلز {r.reelNumber}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Eye size={10} /> {(r.viewCount || 0).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><ThumbsUp size={10} /> {(r.likeCount || 0).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={10} /> {r.commentCount || 0}</span>
                      <span className="flex items-center gap-1"><Star size={10} /> {r.feedbackScore || '-'}/5</span>
                    </div>
                  </div>
                ))}
              </Card>
            );
          })}
        </div>
      )}

      {/* Revision Modal */}
      <Modal isOpen={showRevision} onClose={() => { setShowRevision(false); setRevisionComment(''); }} title="ارسال اصلاحیه سناریو">
        <div className="space-y-4">
          {selectedReel && (
            <div className="bg-slate-700/40 rounded-lg p-3">
              <p className="text-xs font-bold text-white">ریلز {selectedReel.reelNumber}: {selectedReel.title}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{selectedReel.scenarioText}</p>
            </div>
          )}
          <Textarea label="توضیح اصلاحیه" value={revisionComment} onChange={e => setRevisionComment(e.target.value)} rows={4} placeholder="لطفاً توضیح دهید چه تغییراتی می‌خواهید..." />
          <button
            onClick={() => selectedReel && myPages.find(p => (p.reels || []).some(r => r.id === selectedReel.id)) && handleRevisionSubmit(selectedReel, myPages.find(p => (p.reels || []).some(r => r.id === selectedReel.id))!.id)}
            className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold text-sm transition-colors"
          >
            ارسال اصلاحیه
          </button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-950/40 border-green-900/40 text-green-300',
    purple: 'bg-purple-950/40 border-purple-900/40 text-purple-300',
    blue: 'bg-blue-950/40 border-blue-900/40 text-blue-300',
    pink: 'bg-pink-950/40 border-pink-900/40 text-pink-300',
  };
  return (
    <div className={`rounded-xl p-3 border ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs">{label}</span></div>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}
