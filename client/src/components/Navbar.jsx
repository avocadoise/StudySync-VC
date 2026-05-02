import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  
  // Get initials or default
  const getInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center md:hidden">
          <button 
            onClick={onMenuClick}
            className="rounded p-1 text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300 dark:hover:text-blue-300"
          >
            <Menu size={24} />
          </button>
          <span className="ml-3 text-xl font-bold text-[#010057] dark:text-blue-100">StudySync</span>
        </div>
        <div className="hidden md:block">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'}!
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-100 text-lg font-bold text-blue-700 shadow-sm dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-200">
            {getInitials()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
