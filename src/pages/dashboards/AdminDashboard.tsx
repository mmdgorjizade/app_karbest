import { useState } from 'react';
import { Upload, BarChart2, CheckCircle, Link, Send, Eye, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Input, Textarea } from '../../components/common/Input';
import { Reel } from '../../data/store';

export default function AdminDashboard() {
  const { currentUser, pages, updateReel, addNotification } = useApp();
  const [selectedReel, setSelectedReel] = useState<(Reel & { pageId: string; pageName: string }) | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [postLink, setPostLink] = useState('');
  const [weeklyReport, setWeeklyReport] = useState('');
  const [statsReel, setStatsReel] = useState<Reel & { pageId: string; pageName: string } | null>(null);
  const [viewCount, setViewCount] = useState('');
  const [likeCount, setLikeCount] = useState('');
  const [commentCount, setCommentCount] = useState('');
  const [followerGain, setFollowerGain] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'analytics' | 'report'>('upload');

  if (!currentUser) return null;
  const myPages = pages.filter(p => p.adminId === currentUser.id);
  const allReels = myPages.flatMap(p => (p.reels || []).map(r => ({ ...r, pageId: p.id, pageName: p.name })));

  const readyToUpload = allReels.filter(r => r.editingStatus === 'done' && r.uploadStatus === 'not_uploaded');
  const uploaded = allReels.filter(r => r.uploadStatus === 'uploaded');
  const needStats = uploaded.filter(r => !r.viewCount);

  const handleUpload = () => {
    if (!selectedReel || !postLink.trim()) return;
    const updated: Reel = {
      ...selectedReel,
      uploadStatus: 'uploaded',
      uploadDate: new Date().toLocaleDateString('fa-IR'),
      postLink,
      overallStatus: 'uploaded',
    };
    updateReel(selectedReel.pageId, updated);
    addNotification({
      title: '✅ ریلز بارگذاری شد',
      message: `ریلز ${selectedReel.reelNumber} در اینستاگرام بارگذاری شد`,
      type: 'success',
      forRoles: ['manager', 'client', 'scriptwriter'],
    });
    setShowUploadModal(false);
    setPostLink('');
    setSelectedReel(null);
  };

  const handleUpdateStats = () => {
    if (!statsReel) return;
    const views = parseInt(viewCount) || 0;
    const followers = parseInt(followerGain) || 0;
    const pages_f = myPages.find(p => p.id === statsReel.pageId);
    const rate = pages_f?.followers ? ((followers / pages_f.followers) * 100).toFixed(2) : '0';
    const updated: Reel = {
      ...statsReel,
      viewCount: views,
      likeCount: parseInt(likeCount) || 0,
      commentCount: parseInt(commentCount) || 0,
      followerGain: followers,
      followerGainRate: parseFloat(rate),
    };
    updateReel(statsReel.pageId, updated);
    addNotification({
      title: '📊 آمار به‌روز شد',
      message: `آمار ریلز ${statsReel.reelNumber}: ${views.toLocaleString()} ویو`,
      type: 'info',
      forRoles: ['manager', 'client'],
    });
    setShowStatsModal(false);
    setViewCount(''); setLikeCount(''); setCommentCount(''); setFollowerGain('');
    setStatsReel(null);
  };

  const handleSendWeeklyReport = () => {
    if (!weeklyReport.trim()) return;
    addNotification({
      title: '📊 گزارش هفتگی',
      message: weeklyReport,
      type: 'info',
      forRoles: ['manager', 'client'],
    });
    setWeeklyReport('');
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-lg font-black text-gradient">پنل ادمین</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-yellow-950/40 border border-yellow-900/40 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-yellow-300">{readyToUpload.length}</p>
          <p className="text-[10px] text-yellow-500">آماده بارگذاری</p>
        </div>
        <div className="bg-green-950/40 border border-green-900/40 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-green-300">{uploaded.length}</p>
          <p className="text-[10px] text-green-500">بارگذاری شده</p>
        </div>
        <div className="bg-blue-950/40 border border-blue-900/40 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-blue-300">{needStats.length}</p>
          <p className="text-[10px] text-blue-500">نیاز به آمار</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl">
        {[
          { id: 'upload', label: '📱 بارگذاری', count: readyToUpload.length },
          { id: 'analytics', label: '📊 آمار', count: needStats.length },
          { id: 'report', label: '📈 گزارش', count: 0 },
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

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-2">
          {readyToUpload.length === 0 ? (
            <Card className="text-center text-sm text-slate-500">هیچ ریلزی برای بارگذاری نیست ✅</Card>
          ) : readyToUpload.map(reel => (
            <Card key={reel.id} className="!p-3 border-r-2 border-r-green-500">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-white">ریلز {reel.reelNumber}: {reel.title}</p>
                <StatusBadge status="edit_done" />
              </div>
              <p className="text-[10px] text-slate-400 mb-2">{reel.pageName} | هدف: {reel.targetPublishDate}</p>
              {reel.editingOutputLink && (
                <a href={reel.editingOutputLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 mb-2">
                  <Link size={10} /> لینک خروجی تدوین
                </a>
              )}
              <button onClick={() => { setSelectedReel(reel); setShowUploadModal(true); }}
                className="w-full py-1.5 gradient-bg text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:opacity-90 transition-opacity">
                <Upload size={12} /> بارگذاری در اینستاگرام
              </button>
            </Card>
          ))}

          {uploaded.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-400 mb-2">بارگذاری شده‌ها ({uploaded.length})</h3>
              {uploaded.map(reel => (
                <Card key={reel.id} className="!p-3 mb-2 opacity-70">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">ریلز {reel.reelNumber}: {reel.title}</p>
                    <StatusBadge status="uploaded" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{reel.pageName} | {reel.uploadDate}</p>
                  {reel.postLink && (
                    <a href={reel.postLink} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 mt-1">
                      <Link size={10} /> لینک پست
                    </a>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">آمار ریلزهای بارگذاری شده را وارد کنید</p>
          {uploaded.map(reel => (
            <Card key={reel.id} className="!p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-white">ریلز {reel.reelNumber}: {reel.title}</p>
                {reel.viewCount ? (
                  <span className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle size={10} /> ثبت شده</span>
                ) : (
                  <span className="text-[10px] text-yellow-400">بدون آمار</span>
                )}
              </div>
              {reel.viewCount ? (
                <div className="grid grid-cols-4 gap-1 text-center">
                  <div><p className="text-sm font-black text-white">{(reel.viewCount/1000).toFixed(1)}K</p><p className="text-[9px] text-slate-500">ویو</p></div>
                  <div><p className="text-sm font-black text-white">{reel.likeCount?.toLocaleString()}</p><p className="text-[9px] text-slate-500">لایک</p></div>
                  <div><p className="text-sm font-black text-white">{reel.commentCount}</p><p className="text-[9px] text-slate-500">کامنت</p></div>
                  <div><p className="text-sm font-black text-white">+{reel.followerGain}</p><p className="text-[9px] text-slate-500">فالوور</p></div>
                </div>
              ) : (
                <button onClick={() => { setStatsReel(reel); setShowStatsModal(true); }}
                  className="w-full py-1.5 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors">
                  <Eye size={12} /> ثبت آمار
                </button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Report Tab */}
      {activeTab === 'report' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <BarChart2 size={15} className="text-indigo-400" />
              خلاصه آمار هفتگی
            </h3>
            {myPages.map(page => {
              const reels = (page.reels || []).filter(r => r.uploadStatus === 'uploaded');
              const views = reels.reduce((s, r) => s + (r.viewCount || 0), 0);
              const followers = reels.reduce((s, r) => s + (r.followerGain || 0), 0);
              return (
                <div key={page.id} className="mb-3 p-3 bg-slate-700/30 rounded-xl">
                  <p className="text-xs font-bold text-white mb-2">📱 {page.name}</p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div><p className="font-black text-white">{reels.length}</p><p className="text-slate-400">ریلز</p></div>
                    <div><p className="font-black text-white">{(views/1000).toFixed(1)}K</p><p className="text-slate-400">ویو</p></div>
                    <div><p className="font-black text-white">+{followers}</p><p className="text-slate-400">فالوور</p></div>
                  </div>
                </div>
              );
            })}
          </Card>

          <div className="space-y-2">
            <Textarea
              label="گزارش هفتگی برای ارسال"
              value={weeklyReport}
              onChange={e => setWeeklyReport(e.target.value)}
              rows={5}
              placeholder="این هفته X ریلز بارگذاری شد، کل ویوها Y بود و..."
            />
            <button onClick={handleSendWeeklyReport} className="w-full py-2.5 gradient-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <Send size={16} /> ارسال گزارش هفتگی
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => { setShowUploadModal(false); setPostLink(''); }} title="بارگذاری در اینستاگرام">
        <div className="space-y-4">
          {selectedReel && (
            <div className="bg-slate-700/40 rounded-lg p-3">
              <p className="text-xs font-bold text-white">{selectedReel.pageName} | ریلز {selectedReel.reelNumber}</p>
              <p className="text-xs text-slate-400 mt-1">{selectedReel.reelTitle || selectedReel.title}</p>
              {selectedReel.editingOutputLink && (
                <a href={selectedReel.editingOutputLink} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 flex items-center gap-1 mt-1">
                  <Link size={10} /> دانلود خروجی تدوین
                </a>
              )}
            </div>
          )}
          <Input label="لینک پست اینستاگرام" value={postLink} onChange={e => setPostLink(e.target.value)} placeholder="https://instagram.com/p/..." />
          <button onClick={handleUpload} className="w-full py-2.5 gradient-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            تایید بارگذاری
          </button>
        </div>
      </Modal>

      {/* Stats Modal */}
      <Modal isOpen={showStatsModal} onClose={() => { setShowStatsModal(false); }} title="ثبت آمار ریلز">
        <div className="space-y-4">
          {statsReel && (
            <p className="text-xs font-bold text-white">ریلز {statsReel.reelNumber}: {statsReel.title}</p>
          )}
          <Input label="تعداد ویو" type="number" value={viewCount} onChange={e => setViewCount(e.target.value)} placeholder="15000" />
          <Input label="تعداد لایک" type="number" value={likeCount} onChange={e => setLikeCount(e.target.value)} placeholder="890" />
          <Input label="تعداد کامنت" type="number" value={commentCount} onChange={e => setCommentCount(e.target.value)} placeholder="45" />
          <Input label="فالوور جذب شده" type="number" value={followerGain} onChange={e => setFollowerGain(e.target.value)} placeholder="120" />
          <button onClick={handleUpdateStats} className="w-full py-2.5 gradient-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            ثبت آمار
          </button>
        </div>
      </Modal>
    </div>
  );
}
