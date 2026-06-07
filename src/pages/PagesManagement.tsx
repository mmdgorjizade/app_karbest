import { useState } from 'react';
import { Plus, ChevronRight, Search, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Page, Reel, UserRole } from '../data/store';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import { Input, Select, Textarea } from '../components/common/Input';
import ReelDetail from '../components/reels/ReelDetail';
import AddPageModal from '../components/pages/AddPageModal';

export default function PagesManagement() {
  const { currentUser, pages, users } = useApp();
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [showAddPage, setShowAddPage] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  if (!currentUser) return null;

  const isManager = currentUser.role === 'manager';
  const isClient = currentUser.role === 'client';
  const isAdmin = currentUser.role === 'admin';

  // Filter pages based on role
  let visiblePages = pages;
  if (isClient) visiblePages = pages.filter(p => p.clientId === currentUser.id);
  else if (!isManager) visiblePages = pages.filter(p =>
    p.adminId === currentUser.id ||
    p.scriptwriterId === currentUser.id ||
    p.cameramanId === currentUser.id ||
    p.editorId === currentUser.id
  );

  const filteredPages = visiblePages.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.instagramHandle.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedReel && selectedPage) {
    return <ReelDetail reel={selectedReel} page={selectedPage} onBack={() => setSelectedReel(null)} />;
  }

  if (selectedPage) {
    return <PageDetail page={selectedPage} onBack={() => setSelectedPage(null)} onSelectReel={setSelectedReel} />;
  }

  return (
    <div className="p-4 space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gradient">مدیریت پیج‌ها</h2>
        {isManager && (
          <button onClick={() => setShowAddPage(true)} className="flex items-center gap-1.5 px-3 py-2 gradient-bg text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity">
            <Plus size={14} /> پیج جدید
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="جستجوی پیج..."
        />
      </div>

      {/* Pages Grid */}
      {filteredPages.length === 0 ? (
        <Card className="text-center text-sm text-slate-500 py-8">
          <p>هیچ پیجی یافت نشد</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPages.map(page => {
            const reels = page.reels || [];
            const uploaded = reels.filter(r => r.overallStatus === 'uploaded').length;
            const delayed = reels.filter(r => r.delayDays > 0).length;
            const contract = page.contract;
            return (
              <Card key={page.id} hover onClick={() => setSelectedPage(page)} className="!p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xl">
                      📱
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{page.name}</h3>
                      <p className="text-xs text-slate-400">{page.instagramHandle}</p>
                      <p className="text-[10px] text-slate-500">{page.category}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-500" />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className="text-center">
                    <p className="text-sm font-black text-white">{reels.length}</p>
                    <p className="text-[10px] text-slate-500">کل ریلز</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-green-400">{uploaded}</p>
                    <p className="text-[10px] text-slate-500">بارگذاری</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-red-400">{delayed}</p>
                    <p className="text-[10px] text-slate-500">تاخیر</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-indigo-400">{page.followers?.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">فالوور</p>
                  </div>
                </div>

                {/* Contract Bar */}
                {contract && (
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>پیشرفت قرارداد: {uploaded}/{contract.monthlyReelsCount}</span>
                      <span>{Math.round((uploaded / contract.monthlyReelsCount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1">
                      <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${Math.min(100, (uploaded / contract.monthlyReelsCount) * 100)}%` }} />
                    </div>
                  </div>
                )}

                {/* Bottlenecks */}
                {reels.some(r => r.bottleneck) && (
                  <div className="mt-2 text-[10px] text-red-400 flex items-center gap-1">
                    ⚠️ {reels.filter(r => r.bottleneck).length} گلوگاه فعال
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <AddPageModal isOpen={showAddPage} onClose={() => setShowAddPage(false)} />
    </div>
  );
}

// ===========================
// Page Detail Component
// ===========================
function PageDetail({ page, onBack, onSelectReel }: { page: Page; onBack: () => void; onSelectReel: (r: Reel) => void }) {
  const { currentUser, addReel } = useApp();
  const [showAddReel, setShowAddReel] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [newReel, setNewReel] = useState({
    title: '', reelTitle: '', targetPublishDate: '', month: 'دی ۱۴۰۳', week: 'هفته ۱',
  });

  const reels = page.reels || [];
  const isManager = currentUser?.role === 'manager';

  const filteredReels = filterStatus === 'all' ? reels :
    reels.filter(r => r.overallStatus === filterStatus);

  const handleAddReel = () => {
    if (!newReel.title) return;
    const reel: Reel = {
      id: `r${Date.now()}`,
      pageId: page.id,
      month: newReel.month,
      week: newReel.week,
      reelNumber: (reels.length + 1),
      title: newReel.title,
      reelTitle: newReel.reelTitle,
      targetPublishDate: newReel.targetPublishDate,
      scenarioStatus: 'not_started',
      recordingAnnounced: false,
      recordingCancelled: false,
      recordingCancelCount: 0,
      filmingStatus: 'not_started',
      rawFileSent: false,
      priority: 'medium',
      editingStatus: 'not_started',
      clientRevisionCount: 0,
      clientApproved: false,
      uploadStatus: 'not_uploaded',
      responsible: '',
      overallStatus: 'pending_scenario',
      delayDays: 0,
    };
    addReel(page.id, reel);
    setShowAddReel(false);
    setNewReel({ title: '', reelTitle: '', targetPublishDate: '', month: 'دی ۱۴۰۳', week: 'هفته ۱' });
  };

  // Group by week
  const byWeek: Record<string, Reel[]> = {};
  filteredReels.forEach(r => {
    if (!byWeek[r.week]) byWeek[r.week] = [];
    byWeek[r.week].push(r);
  });

  return (
    <div className="p-4 space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
          <ChevronRight size={18} />
        </button>
        <div className="flex-1">
          <h2 className="text-base font-black text-white">{page.name}</h2>
          <p className="text-xs text-slate-400">{page.instagramHandle}</p>
        </div>
        {isManager && (
          <button onClick={() => setShowAddReel(true)} className="flex items-center gap-1 px-3 py-2 gradient-bg text-white rounded-xl text-xs font-bold">
            <Plus size={12} /> ریلز جدید
          </button>
        )}
      </div>

      {/* Page Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="!p-3 text-center">
          <p className="text-xl font-black text-green-400">{reels.filter(r => r.overallStatus === 'uploaded').length}</p>
          <p className="text-[10px] text-slate-500">بارگذاری شده</p>
        </Card>
        <Card className="!p-3 text-center">
          <p className="text-xl font-black text-red-400">{reels.filter(r => r.delayDays > 0).length}</p>
          <p className="text-[10px] text-slate-500">با تاخیر</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { v: 'all', l: 'همه' },
          { v: 'pending_scenario', l: 'سناریو' },
          { v: 'recorded', l: 'ضبط شده' },
          { v: 'editing', l: 'تدوین' },
          { v: 'uploaded', l: 'بارگذاری' },
        ].map(f => (
          <button key={f.v} onClick={() => setFilterStatus(f.v)}
            className={`flex-shrink-0 px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${filterStatus === f.v ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Reels by Week */}
      {Object.entries(byWeek).map(([week, weekReels]) => (
        <div key={week}>
          <h3 className="text-xs font-bold text-slate-400 mb-2">{week}</h3>
          <div className="space-y-2">
            {weekReels.map(reel => (
              <Card key={reel.id} hover onClick={() => onSelectReel(reel)} className="!p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-700/50 px-1.5 py-0.5 rounded">#{reel.reelNumber}</span>
                    <p className="text-xs font-bold text-white">{reel.title}</p>
                  </div>
                  <StatusBadge status={reel.overallStatus} />
                </div>
                {reel.reelTitle && <p className="text-[11px] text-slate-400 mb-1.5">{reel.reelTitle}</p>}
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={reel.priority} />
                  {reel.targetPublishDate && (
                    <span className="text-[10px] text-slate-500">📅 {reel.targetPublishDate}</span>
                  )}
                  {reel.delayDays > 0 && (
                    <span className="text-[10px] text-red-400">⚠️ {reel.delayDays} روز تاخیر</span>
                  )}
                  {reel.bottleneck && (
                    <span className="text-[10px] text-orange-400 truncate max-w-[140px]">🔴 {reel.bottleneck}</span>
                  )}
                </div>
                {/* Progress */}
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  <StepDot done={reel.scenarioStatus === 'approved'} label="سناریو" />
                  <div className="w-3 h-0.5 bg-slate-700" />
                  <StepDot done={reel.filmingStatus === 'done'} label="ضبط" />
                  <div className="w-3 h-0.5 bg-slate-700" />
                  <StepDot done={reel.rawFileSent} label="فایل" />
                  <div className="w-3 h-0.5 bg-slate-700" />
                  <StepDot done={reel.editingStatus === 'done'} label="تدوین" />
                  <div className="w-3 h-0.5 bg-slate-700" />
                  <StepDot done={reel.uploadStatus === 'uploaded'} label="آپلود" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {filteredReels.length === 0 && (
        <Card className="text-center text-sm text-slate-500 py-6">هیچ ریلزی یافت نشد</Card>
      )}

      {/* Add Reel Modal */}
      <Modal isOpen={showAddReel} onClose={() => setShowAddReel(false)} title="افزودن ریلز جدید">
        <div className="space-y-4">
          <Input label="ماه" value={newReel.month} onChange={e => setNewReel({ ...newReel, month: e.target.value })} placeholder="دی ۱۴۰۳" />
          <Input label="هفته" value={newReel.week} onChange={e => setNewReel({ ...newReel, week: e.target.value })} placeholder="هفته ۱" />
          <Input label="ایده/موضوع ریلز" value={newReel.title} onChange={e => setNewReel({ ...newReel, title: e.target.value })} placeholder="مثال: آموزش مراقبت از دندان" />
          <Input label="عنوان ریلز (برای کپشن)" value={newReel.reelTitle} onChange={e => setNewReel({ ...newReel, reelTitle: e.target.value })} placeholder="عنوان جذاب برای نمایش" />
          <Input label="تاریخ انتشار هدف" value={newReel.targetPublishDate} onChange={e => setNewReel({ ...newReel, targetPublishDate: e.target.value })} placeholder="1403/10/25" />
          <button onClick={handleAddReel} className="w-full py-2.5 gradient-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            افزودن ریلز
          </button>
        </div>
      </Modal>
    </div>
  );
}

function StepDot({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`w-3 h-3 rounded-full flex items-center justify-center ${done ? 'bg-green-500' : 'bg-slate-700'}`}>
        {done && <span className="text-[6px] text-white">✓</span>}
      </div>
      <span className="text-[8px] text-slate-600">{label}</span>
    </div>
  );
}
