import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

export function Header() {
  const { user, profile, signOut } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 justify-between sticky top-0 z-30">
      <Link to="/dashboard" className="flex items-center gap-2.5 font-semibold text-gray-900">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <LayoutDashboard size={15} className="text-white" />
        </div>
        <span className="text-[15px]">FormCraft</span>
      </Link>

      {user && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
          >
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={12} className="text-blue-600" />
            </div>
            <span className="font-medium">{profile?.display_name || user.email?.split('@')[0]}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
