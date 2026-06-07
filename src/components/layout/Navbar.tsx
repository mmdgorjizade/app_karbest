import { useState } from 'react';
import { Bell, LogOut, Home, LayoutDashboard, FolderOpen, Menu, X, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../data/store';

interface Props {
  activePage: string;
  setActivePage: (page: string) => void;
}

const roleColors: Record<UserRole, string> = {
  manager: 'from-indigo-600 to-purple-600',
  client: 'from-yellow-600 to-orange-600',
  scriptwriter: 'from-teal-600 to-cyan-600',
  cameraman: 'from-orange-600 to-red-600',
  editor: 'from-pink-600 to-rose-600',
  admin: 'from-blue-600 to-indigo-600',
};

const roleLabels: Record<UserRole, string> = {
  manager: 'مدیر',
  client: 'کارفرما',
  scriptwriter: 'سناریونویس',
  cameraman: 'فیلمبردار',
  editor: 'تدوینگر',
  admin: 'ادمین',
};

export default function Navbar({ activePage, setActivePage }: Props) {
  const { currentUser, setCurrentUser, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!currentUser) return null;

  const userNotifs = notifications.filter(n => n.forRoles.includes(currentUser.role));
  const unread = userNotifs.filter(n => !n.read);

  const navItems = [
    { id: 'home', label: 'خانه', icon: <Home size={18} /> },
    { id: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard size={18} /> },
    { id: 'pages', label: 'مدیریت پیج‌ها', icon: <FolderOpen size={18} /> },
  ];

  return (
    <>
      <nav className="fixed top-0 right-0 left-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-sm">🎬</div>
            <span className="font-black text-gradient text-lg hidden sm:block">کاربیست</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePage === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
                className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <Bell size={20} />
                {unread.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {unread.length}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="flex items-center justify-between p-3 border-b border-slate-700">
                    <span className="text-sm font-bold text-white">اعلان‌ها ({unread.length} جدید)</span>
                    {unread.length > 0 && (
                      <button onClick={markAllNotificationsRead} className="text-xs text-indigo-400 hover:text-indigo-300">
                        همه خواندم
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-700">
                    {userNotifs.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-6">اعلانی وجود ندارد</p>
                    ) : userNotifs.slice(0, 10).map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 cursor-pointer transition-colors ${n.read ? 'opacity-60 hover:bg-slate-700/30' : 'bg-indigo-900/20 hover:bg-indigo-900/30'}`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && <span className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />}
                          <div>
                            <p className="text-xs font-bold text-white">{n.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-slate-600 mt-1">
                              {n.timestamp.toLocaleDateString('fa-IR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${roleColors[currentUser.role]} flex items-center justify-center text-sm`}>
                  {currentUser.avatar}
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-white leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400">{roleLabels[currentUser.role]}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-700">
                    <p className="text-sm font-bold text-white">{currentUser.name}</p>
                    <p className="text-xs text-slate-400">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => setCurrentUser(null)}
                    className="w-full flex items-center gap-2 p-3 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                  >
                    <LogOut size={16} />
                    خروج از حساب
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              {showMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {showMenu && (
          <div className="md:hidden border-t border-slate-700 bg-slate-900 px-4 py-2 flex gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setShowMenu(false); }}
                className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-all ${
                  activePage === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>
      {/* Spacer */}
      <div className="h-14" />
      {/* Click outside to close */}
      {(showNotifs || showUserMenu) && (
        <div className="fixed inset-0 z-30" onClick={() => { setShowNotifs(false); setShowUserMenu(false); }} />
      )}
    </>
  );
}
