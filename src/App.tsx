import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PagesManagement from './pages/PagesManagement';
import Navbar from './components/layout/Navbar';

function AppContent() {
  const { currentUser } = useApp();
  const [activePage, setActivePage] = useState('home');

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <div className="max-w-2xl mx-auto">
        {activePage === 'home' && <Home />}
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'pages' && <PagesManagement />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
