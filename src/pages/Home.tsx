import { useState } from 'react';
import { Plus, Eye, Clock, AlertTriangle, CheckCircle, TrendingUp, Send, Users, Megaphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../data/store';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import { Input, Textarea, Select } from '../components/common/Input';

export default function Home() {
  const { currentUser, stories, notifications, pages, addStory, addNotification, users } = useApp();
  const [showAddStory, setShowAddStory] = useState(false);
  const [showSendNotif, setShowSendNotif] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [storyRoles, setStoryRoles] = useState<UserRole[]>(['manager', 'scriptwriter', 'cameraman', 'editor', 'admin']);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'warning' | 'success' | 'error'>('info');
  const [selectedStory, setSelectedStory] = useState<string | null>(null);

  if (!currentUser) return null;

  const isManager = currentUser.role === 'manager';
  const myNotifs = notifications.filter(n => n.forRoles.includes(currentUser.role)).slice(0, 5);
  const myStories = stories.filter(s => s.forRoles.includes(currentUser.role));

  // Stats
  const allReels = pages.flatMap(p => p.reels || []);
  const totalReels = allReels.length;
  const uploadedReels = allReels.filter(r => r.overallStatus === 'uploaded').length;
  const delayedReels = allReels.filter(r => r.delayDays > 0).length;
  const pendingEdit = allReels.filter(r => r.editingStatus === 'not_started' && r.filmingStatus === 'done').length;

  const handleAddStory = () => {
    if (!storyTitle.trim() || !storyContent.trim()) return;
    addStory({ title: storyTitle, content: storyContent, author: currentUser.name, forRoles: storyRoles });
    setStoryTitle(''); setStoryContent('');
    setShowAddStory(false);
    addNotification({ title: '📢 استوری جدید', message: `${currentUser.name} یک استوری منتشر کرد: ${storyTitle}`, type: 'info', forRoles: storyRoles });
  };

  const handleSendNotif = () => {
    if (!notifTitle.trim() || !notifMsg.trim()) return;
    addNotification({ title: notifTitle, message: notifMsg, type: notifType, forRoles: ['manager', 'client', 'scriptwriter', 'cameraman', 'editor', 'admin'] });
    setNotifTitle(''); setNotifMsg('');
    setShowSendNotif(false);
  };

  const toggleRole = (role: UserRole) => {
    setStoryRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const allRoles: { role: UserRole; label: string }[] = [
    { role: 'manager', label: 'مدیر' }, { role: 'client', label: 'کارفرما' },
    { role: 'scriptwriter', label: 'سناریونویس' }, { role: 'cameraman', label: 'فیلمبردار' },
    { role: 'editor', label: 'تدوینگر' }, { role: 'admin', label: 'ادمین' },
  ];

  const storySelected = selectedStory ? myStories.find(s => s.id === selectedStory) : null;

  return (
    <div className="p-4 space-y-5 fade-in">
      {/* Welcome */}
      <div className="gradient-bg rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <p className="text-white/70 text-sm">خوش آمدید،</p>
          <h2 className="text-xl font-black text-white mt-0.5">{currentUser.name} {currentUser.avatar}</h2>
          <p className="text-white/60 text-xs mt-1">{new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Quick Stats */}
      {isManager && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={<TrendingUp size={18} />} label="کل ریلزها" value={totalReels} color="indigo" />
          <StatCard icon={<CheckCircle size={18} />} label="بارگذاری شده" value={uploadedReels} color="green" />
          <StatCard icon={<AlertTriangle size={18} />} label="تاخیر دارند" value={delayedReels} color="red" />
          <StatCard icon={<Clock size={18} />} label="انتظار تدوین" value={pendingEdit} color="orange" />
        </div>
      )}

      {/* Stories Row */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Megaphone size={16} className="text-indigo-400" />
            اطلاع‌رسانی‌ها
          </h3>
          {isManager && (
            <button
              onClick={() => setShowAddStory(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Plus size={14} />
              استوری جدید
            </button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {myStories.length === 0 ? (
            <div className="text-sm text-slate-500 bg-slate-800/40 rounded-xl p-4 w-full text-center">هیچ اطلاع‌رسانی‌ای وجود ندارد</div>
          ) : myStories.map(story => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(story.id)}
              className="flex-shrink-0 w-20 flex flex-col items-center gap-1 group"
            >
              <div className="w-16 h-16 rounded-2xl gradient-bg p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-2xl">
                  📢
                </div>
              </div>
              <span className="text-[10px] text-slate-400 text-center line-clamp-2 leading-tight">{story.title.replace(/^[^\s]+\s/, '')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-400" />
            اعلان‌های اخیر
          </h3>
          {isManager && (
            <button
              onClick={() => setShowSendNotif(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <Send size={14} />
              ارسال نوتیف
            </button>
          )}
        </div>
        <div className="space-y-2">
          {myNotifs.length === 0 ? (
            <Card className="text-center text-sm text-slate-500">اعلانی وجود ندارد</Card>
          ) : myNotifs.map(n => (
            <Card key={n.id} className={`!p-3 border-r-2 ${
              n.type === 'warning' ? 'border-r-yellow-500' :
              n.type === 'success' ? 'border-r-green-500' :
              n.type === 'error' ? 'border-r-red-500' : 'border-r-blue-500'
            } ${!n.read ? 'bg-indigo-950/30' : ''}`}>
              <div className="flex items-start gap-2">
                <div>
                  <p className="text-xs font-bold text-white">{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{n.timestamp.toLocaleDateString('fa-IR')}</p>
                </div>
                {!n.read && <span className="w-2 h-2 bg-indigo-400 rounded-full mt-1 flex-shrink-0" />}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Members (Manager Only) */}
      {isManager && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Users size={16} className="text-purple-400" />
            اعضای تیم
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {users.filter(u => u.role !== 'client').map(u => (
              <Card key={u.id} className="!p-3 flex items-center gap-2">
                <span className="text-xl">{u.avatar}</span>
                <div>
                  <p className="text-xs font-bold text-white">{u.name}</p>
                  <p className="text-[10px] text-slate-500">{u.email}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      <Modal isOpen={!!storySelected} onClose={() => setSelectedStory(null)} title={storySelected?.title || ''}>
        {storySelected && (
          <div className="space-y-4">
            <div className="w-full h-48 gradient-bg rounded-xl flex items-center justify-center text-6xl">
              📢
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{storySelected.content}</p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>نویسنده: {storySelected.author}</span>
              <span className="flex items-center gap-1">
                <Eye size={12} /> {storySelected.views} بازدید
              </span>
            </div>
            <p className="text-xs text-slate-600">{storySelected.timestamp.toLocaleDateString('fa-IR')}</p>
          </div>
        )}
      </Modal>

      {/* Add Story Modal */}
      <Modal isOpen={showAddStory} onClose={() => setShowAddStory(false)} title="افزودن استوری جدید">
        <div className="space-y-4">
          <Input label="عنوان استوری" value={storyTitle} onChange={e => setStoryTitle(e.target.value)} placeholder="مثال: 📢 جلسه هفتگی" />
          <Textarea label="متن استوری" value={storyContent} onChange={e => setStoryContent(e.target.value)} rows={4} placeholder="متن پیام را بنویسید..." />
          <div>
            <p className="text-xs text-slate-400 font-medium mb-2">برای چه کسانی؟</p>
            <div className="flex flex-wrap gap-2">
              {allRoles.map(({ role, label }) => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    storyRoles.includes(role) ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleAddStory} className="w-full py-2.5 gradient-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            انتشار استوری
          </button>
        </div>
      </Modal>

      {/* Send Notification Modal */}
      <Modal isOpen={showSendNotif} onClose={() => setShowSendNotif(false)} title="ارسال اعلان">
        <div className="space-y-4">
          <Input label="عنوان اعلان" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="عنوان پیام..." />
          <Textarea label="متن اعلان" value={notifMsg} onChange={e => setNotifMsg(e.target.value)} rows={3} placeholder="متن پیام..." />
          <Select
            label="نوع اعلان"
            value={notifType}
            onChange={e => setNotifType(e.target.value as typeof notifType)}
            options={[
              { value: 'info', label: '💙 اطلاعات' },
              { value: 'warning', label: '⚠️ هشدار' },
              { value: 'success', label: '✅ موفقیت' },
              { value: 'error', label: '🔴 خطا' },
            ]}
          />
          <button onClick={handleSendNotif} className="w-full py-2.5 gradient-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            ارسال به همه
          </button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-900/40 text-indigo-300 border-indigo-800/50',
    green: 'bg-green-900/40 text-green-300 border-green-800/50',
    red: 'bg-red-900/40 text-red-300 border-red-800/50',
    orange: 'bg-orange-900/40 text-orange-300 border-orange-800/50',
  };
  return (
    <div className={`rounded-xl p-3 border ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}
