import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Dumbbell, LogOut, Activity, BookOpen, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <Dumbbell size={24} />
          Workout Logger
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1 hover:text-blue-200 transition">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          
          <Link to="/exercises" className="flex items-center gap-1 hover:text-blue-200 transition">
            <Activity size={18} /> Exercises
          </Link>
          
          <Link to="/sessions" className="flex items-center gap-1 hover:text-blue-200 transition">
            <Dumbbell size={18} /> Sessions
          </Link>
          
          <Link to="/notes" className="flex items-center gap-1 hover:text-blue-200 transition">
            <BookOpen size={18} /> Notes
          </Link>
          
          <div className="border-l border-blue-400 h-6 mx-2"></div>
          
          <span className="font-semibold">{user?.username}</span>
          <button onClick={handleLogout} className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;