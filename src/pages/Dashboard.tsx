import { useApp } from '../context/AppContext';
import ManagerDashboard from './dashboards/ManagerDashboard';
import ClientDashboard from './dashboards/ClientDashboard';
import ScriptwriterDashboard from './dashboards/ScriptwriterDashboard';
import CameramanDashboard from './dashboards/CameramanDashboard';
import EditorDashboard from './dashboards/EditorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

export default function Dashboard() {
  const { currentUser } = useApp();
  if (!currentUser) return null;

  switch (currentUser.role) {
    case 'manager': return <ManagerDashboard />;
    case 'client': return <ClientDashboard />;
    case 'scriptwriter': return <ScriptwriterDashboard />;
    case 'cameraman': return <CameramanDashboard />;
    case 'editor': return <EditorDashboard />;
    case 'admin': return <AdminDashboard />;
    default: return <ManagerDashboard />;
  }
}
