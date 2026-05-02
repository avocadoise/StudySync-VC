import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar,
  CalendarDays,
  FileText,
  Timer,
  BrainCircuit,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Subjects', path: '/subjects', icon: <BookOpen size={20} /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
    { name: 'Study Planner', path: '/study-planner', icon: <Calendar size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <CalendarDays size={20} /> },
    { name: 'Notes', path: '/notes', icon: <NotesIcon size={20} /> },
    { name: 'Focus Timer', path: '/focus-timer', icon: <Timer size={20} /> },
    { name: 'AI Reviewer', path: '/ai-reviewer', icon: <BrainCircuit size={20} /> },
  ];

  // Helper component to fix Notes icon if needed, or import directly
  function NotesIcon(props) {
    return <FileText {...props} />;
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Main Sidebar Container */}
      <div 
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white shadow-xl md:shadow-none h-full flex flex-col justify-between border-r border-gray-100 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="p-6 pb-2 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#010057' }}>StudySync</h1>
            {/* Mobile Close Button */}
            <button 
              onClick={onClose} 
              className="md:hidden text-gray-400 hover:text-red-500 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="mt-4 text-sm font-medium space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => onClose && onClose()} // Auto-close on mobile tap
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 mx-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-4 mb-4 border-t border-gray-50 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
