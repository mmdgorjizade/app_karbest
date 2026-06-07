import { useState } from 'react';
import { LogIn, Users, Shield, Camera, Edit3, Film, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../data/store';

const roleInfo: Record<UserRole, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  manager: { label: 'مدیر', icon: <Shield size={20} />, color: 'from-indigo-600 to-purple-600', description: 'دسترسی کامل به همه بخش‌ها' },
  client: { label: 'کارفرما', icon: <Star size={20} />, color: 'from-yellow-600 to-orange-600', description: 'سناریوها، اولویت‌بندی، آمار پیج' },
  scriptwriter: { label: 'سناریونویس', icon: <Edit3 size={20} />, color: 'from-teal-600 to-cyan-600', description: 'نوشتن سناریو و مدیریت محتوا' },
  cameraman: { label: 'فیلمبردار', icon: <Camera size={20} />, color: 'from-orange-600 to-red-600', description: 'فیلمبرداری و ارسال فایل‌ها' },
  editor: { label: 'تدوینگر', icon: <Film size={20} />, color: 'from-pink-600 to-rose-600', description: 'تدوین و خروجی نهایی' },
  admin: { label: 'ادمین', icon: <Users size={20} />, color: 'from-blue-600 to-indigo-600', description: 'بارگذاری و آمار هفتگی' },
};

export default function Login() {
  const { users, setCurrentUser } = useApp();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const handleSelect = (user: User) => {
    setSelectedUser(user);
    setStep('confirm');
  };

  const handleLogin = () => {
    if (selectedUser) setCurrentUser(selectedUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-center mb-8 fade-in">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-2xl">🎬</span>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-black text-gradient">کاربیست</h1>
            <p className="text-xs text-slate-500">سیستم مدیریت تولید محتوا</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm">لطفاً کاربر مورد نظر را انتخاب کنید</p>
      </div>

      {step === 'select' ? (
        <div className="w-full max-w-md space-y-3 fade-in">
          {users.map(user => {
            const info = roleInfo[user.role];
            return (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className={`w-full flex items-center gap-4 p-4 bg-slate-800/60 border border-slate-700 rounded-xl hover:border-indigo-500/50 transition-all group card-hover`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
                  {info.icon}
                </div>
                <div className="text-right flex-1">
                  <div className="font-bold text-white text-sm">{user.name}</div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </div>
                <div className="text-left">
                  <span className={`text-xs px-2 py-1 rounded-lg bg-gradient-to-r ${info.color} text-white font-medium`}>
                    {info.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : selectedUser ? (
        <div className="w-full max-w-sm fade-in">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center space-y-4">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleInfo[selectedUser.role].color} flex items-center justify-center text-4xl mx-auto shadow-lg`}>
              {selectedUser.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{selectedUser.name}</h2>
              <p className="text-sm text-slate-400">{selectedUser.email}</p>
              <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full bg-gradient-to-r ${roleInfo[selectedUser.role].color} text-white font-medium`}>
                {roleInfo[selectedUser.role].label}
              </span>
            </div>
            <p className="text-sm text-slate-400">{roleInfo[selectedUser.role].description}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
              >
                بازگشت
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 py-2.5 rounded-xl gradient-bg hover:opacity-90 text-white text-sm font-bold transition-opacity flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                ورود
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <p className="mt-8 text-xs text-slate-600">© ۱۴۰۳ کاربیست - تمامی حقوق محفوظ است</p>
    </div>
  );
}
