import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Plus, Trash2, AlertCircle, CheckCircle2, BarChart2, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../data/store';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Input, Select } from '../../components/common/Input';

const roleOptions = [
  { value: 'manager', label: 'مدیر' },
  { value: 'client', label: 'کارفرما' },
  { value: 'scriptwriter', label: 'سناریونویس' },
  { value: 'cameraman', label: 'فیلمبردار' },
  { value: 'editor', label: 'تدوینگر' },
  { value: 'admin', label: 'ادمین' },
];

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function ManagerDashboard() {
  const { pages, users, addUser, removeUser } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'pages'>('overview');
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string>(pages[0]?.id || '');
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'scriptwriter' as UserRole, phone: '' });

  const allReels = pages.flatMap(p => p.reels || []);
  const uploaded = allReels.filter(r => r.overallStatus === 'uploaded').length;
  const inProgress = allReels.filter(r => !['uploaded', 'pending_scenario'].includes(r.overallStatus)).length;
  const delayed = allReels.filter(r => r.delayDays > 0).length;
  const totalViews = allReels.reduce((sum, r) => sum + (r.viewCount || 0), 0);
  const totalFollowers = allReels.reduce((sum, r) => sum + (r.followerGain || 0), 0);

  const pageStats = pages.map(p => ({
    name: p.name.slice(0, 8),
    reels: (p.reels || []).length,
    uploaded: (p.reels || []).filter(r => r.overallStatus === 'uploaded').length,
    views: (p.reels || []).reduce((s, r) => s + (r.viewCount || 0), 0),
  }));

  const statusData = [
    { name: 'بارگذاری شده', value: uploaded },
    { name: 'در جریان', value: inProgress },
    { name: 'با تاخیر', value: delayed },
    { name: 'انتظار', value: allReels.length - uploaded - inProgress },
  ].filter(d => d.value > 0);

  const selectedPage = pages.find(p => p.id === selectedPageId);
  const selectedReels = selectedPage?.reels || [];

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    const user: User = {
      id: `u${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: roleAvatars[newUser.role],
      phone: newUser.phone,
    };
    addUser(user);
    setNewUser({ name: '', email: '', role: 'scriptwriter', phone: '' });
    setShowAddUser(false);
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gradient">داشبورد مدیریت</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl">
        {[
          { id: 'overview', label: 'نمای کلی', icon: <BarChart2 size={14} /> },
          { id: 'users', label: 'اعضا', icon: <Users size={14} /> },
          { id: 'pages', label: 'گزارش پیج‌ها', icon: <FileText size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <KpiCard label="کل ریلزها" value={allReels.length} icon="🎬" color="indigo" />
            <KpiCard label="بارگذاری شده" value={uploaded} icon="✅" color="green" />
            <KpiCard label="تاخیر دارند" value={delayed} icon="⚠️" color="red" />
            <KpiCard label="کل ویوها" value={`${(totalViews / 1000).toFixed(0)}K`} icon="👁️" color="purple" />
            <KpiCard label="جذب فالوور" value={totalFollowers} icon="👥" color="blue" />
            <KpiCard label="در جریان" value={inProgress} icon="🔄" color="yellow" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-bold text-white mb-3">عملکرد پیج‌ها</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={pageStats}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="uploaded" fill="#6366f1" name="بارگذاری" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reels" fill="#334155" name="کل ریلز" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="text-sm font-bold text-white mb-3">وضعیت کلی ریلزها</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={150}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 flex-1">
                  {statusData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-400">{d.name}</span>
                      <span className="text-white font-bold mr-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Bottlenecks */}
          <Card>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <AlertCircle size={15} className="text-red-400" />
              گلوگاه‌ها و مشکلات فعال
            </h3>
            <div className="space-y-2">
              {allReels.filter(r => r.bottleneck).map(r => {
                const page = pages.find(p => p.id === r.pageId);
                return (
                  <div key={r.id} className="flex items-start gap-3 p-2.5 bg-red-950/30 border border-red-900/40 rounded-lg">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">{page?.name} — ریلز {r.reelNumber}: {r.title}</p>
                      <p className="text-xs text-red-300">{r.bottleneck}</p>
                      {r.delayDays > 0 && <span className="text-[10px] text-red-500">{r.delayDays} روز تاخیر</span>}
                    </div>
                  </div>
                );
              })}
              {allReels.filter(r => r.bottleneck).length === 0 && (
                <p className="text-sm text-green-400 flex items-center gap-2"><CheckCircle2 size={14} /> هیچ گلوگاهی وجود ندارد</p>
              )}
            </div>
          </Card>

          {/* Contracts */}
          <Card>
            <h3 className="text-sm font-bold text-white mb-3">وضعیت قراردادها</h3>
            <div className="space-y-3">
              {pages.map(p => {
                const contract = p.contract;
                if (!contract) return null;
                const pageReels = p.reels || [];
                const uploaded = pageReels.filter(r => r.overallStatus === 'uploaded').length;
                const extra = Math.max(0, uploaded - contract.monthlyReelsCount);
                const progress = Math.min(100, (uploaded / contract.monthlyReelsCount) * 100);
                return (
                  <div key={p.id} className="p-3 bg-slate-700/40 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-white">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.instagramHandle}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-slate-400">مبلغ قرارداد</p>
                        <p className="text-sm font-bold text-green-400">{contract.contractAmount.toLocaleString()} ت</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <span>ریلز: {uploaded}/{contract.monthlyReelsCount}</span>
                      {extra > 0 && <span className="text-yellow-400">+{extra} ریلز اضافه ({(extra * contract.extraReelCost).toLocaleString()} ت)</span>}
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
              <Plus size={16} /> افزودن عضو
            </button>
          </div>
          <div className="grid gap-3">
            {users.map(user => (
              <Card key={user.id} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColorMap[user.role]} flex items-center justify-center text-lg flex-shrink-0`}>
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  {user.phone && <p className="text-xs text-slate-500">{user.phone}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={user.role} size="sm" />
                  {user.role !== 'manager' && (
                    <button onClick={() => removeUser(user.id)} className="p-1.5 rounded-lg hover:bg-red-900/40 text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pages Report Tab */}
      {activeTab === 'pages' && (
        <div className="space-y-3">
          <Select
            label="انتخاب پیج"
            value={selectedPageId}
            onChange={e => setSelectedPageId(e.target.value)}
            options={pages.map(p => ({ value: p.id, label: p.name }))}
          />
          {selectedPage && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <KpiCard label="کل ریلز" value={selectedReels.length} icon="🎬" color="indigo" />
                <KpiCard label="بارگذاری" value={selectedReels.filter(r => r.overallStatus === 'uploaded').length} icon="✅" color="green" />
                <KpiCard label="کل ویو" value={`${(selectedReels.reduce((s, r) => s + (r.viewCount || 0), 0) / 1000).toFixed(1)}K`} icon="👁️" color="purple" />
                <KpiCard label="فالوور جذب" value={selectedReels.reduce((s, r) => s + (r.followerGain || 0), 0)} icon="👥" color="blue" />
              </div>
              <Card>
                <h3 className="text-sm font-bold text-white mb-3">آمار ریلزها</h3>
                <div className="space-y-2">
                  {selectedReels.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-xs font-bold text-white">ریلز {r.reelNumber}: {r.reelTitle || r.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StatusBadge status={r.overallStatus} />
                          {r.delayDays > 0 && <span className="text-[10px] text-red-400">{r.delayDays} روز تاخیر</span>}
                        </div>
                      </div>
                      <div className="text-left text-xs">
                        {r.viewCount && <p className="text-slate-400">{r.viewCount.toLocaleString()} ویو</p>}
                        {r.followerGain && <p className="text-slate-500">+{r.followerGain} فالوور</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      <Modal isOpen={showAddUser} onClose={() => setShowAddUser(false)} title="افزودن عضو جدید">
        <div className="space-y-4">
          <Input label="نام و نام‌خانوادگی" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="نام کامل..." />
          <Input label="ایمیل" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="email@example.com" />
          <Input label="شماره تلفن" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} placeholder="09..." />
          <Select label="نقش" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })} options={roleOptions} />
          <button onClick={handleAddUser} className="w-full py-2.5 gradient-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            افزودن عضو
          </button>
        </div>
      </Modal>
    </div>
  );
}

const roleColorMap: Record<UserRole, string> = {
  manager: 'from-indigo-600 to-purple-600',
  client: 'from-yellow-600 to-orange-600',
  scriptwriter: 'from-teal-600 to-cyan-600',
  cameraman: 'from-orange-600 to-red-600',
  editor: 'from-pink-600 to-rose-600',
  admin: 'from-blue-600 to-indigo-600',
};

const roleAvatars: Record<UserRole, string> = {
  manager: '👨‍💼', client: '🏢', scriptwriter: '✍️', cameraman: '🎥', editor: '🎬', admin: '📱',
};

function KpiCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-950/50 border-indigo-900/50 text-indigo-300',
    green: 'bg-green-950/50 border-green-900/50 text-green-300',
    red: 'bg-red-950/50 border-red-900/50 text-red-300',
    purple: 'bg-purple-950/50 border-purple-900/50 text-purple-300',
    blue: 'bg-blue-950/50 border-blue-900/50 text-blue-300',
    yellow: 'bg-yellow-950/50 border-yellow-900/50 text-yellow-300',
  };
  return (
    <div className={`rounded-xl p-3 border ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-[11px]">{label}</span>
      </div>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}
