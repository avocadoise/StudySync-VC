import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';

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
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center md:hidden">
          <button 
            onClick={onMenuClick}
            className="text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
          >
            <Menu size={24} />
          </button>
          <span className="ml-3 text-xl font-bold" style={{ color: '#010057' }}>StudySync</span>
        </div>
        <div className="hidden md:block">
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'}!
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg border-2 border-blue-200 shadow-sm">
            {getInitials()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
