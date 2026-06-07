import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, Notification, Page, Reel, Story, USERS, NOTIFICATIONS, PAGES, STORIES } from '../data/store';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  notifications: Notification[];
  stories: Story[];
  pages: Page[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateReel: (pageId: string, reel: Reel) => void;
  addReel: (pageId: string, reel: Reel) => void;
  addPage: (page: Page) => void;
  updatePage: (page: Page) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  addStory: (story: Omit<Story, 'id' | 'timestamp' | 'views'>) => void;
  unreadCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(USERS);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [stories, setStories] = useState<Story[]>(STORIES);
  const [pages, setPages] = useState<Page[]>(PAGES);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newN: Notification = {
      ...n,
      id: `n${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newN, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const updateReel = useCallback((pageId: string, reel: Reel) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      return {
        ...p,
        reels: (p.reels || []).map(r => r.id === reel.id ? reel : r),
      };
    }));
  }, []);

  const addReel = useCallback((pageId: string, reel: Reel) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      return { ...p, reels: [...(p.reels || []), reel] };
    }));
  }, []);

  const addPage = useCallback((page: Page) => {
    setPages(prev => [...prev, page]);
  }, []);

  const updatePage = useCallback((page: Page) => {
    setPages(prev => prev.map(p => p.id === page.id ? page : p));
  }, []);

  const addUser = useCallback((user: User) => {
    setUsers(prev => [...prev, user]);
  }, []);

  const removeUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const addStory = useCallback((story: Omit<Story, 'id' | 'timestamp' | 'views'>) => {
    const newStory: Story = {
      ...story,
      id: `s${Date.now()}`,
      timestamp: new Date(),
      views: 0,
    };
    setStories(prev => [newStory, ...prev]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read &&
    (currentUser ? n.forRoles.includes(currentUser.role) : false)
  ).length;

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      users, notifications, stories, pages,
      addNotification, markNotificationRead, markAllNotificationsRead,
      updateReel, addReel, addPage, updatePage,
      addUser, removeUser, addStory,
      unreadCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
