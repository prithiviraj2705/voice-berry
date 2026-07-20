import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, History, MapPin, User, Settings, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const Sidebar = () => {
  const navigate = useNavigate();
  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
    { name: 'Upcoming Rides', path: '/dashboard/upcoming', icon: <CalendarDays className="w-5 h-5" /> },
    { name: 'Ride History', path: '/dashboard/history', icon: <History className="w-5 h-5" /> },
    { name: 'Saved Addresses', path: '/dashboard/addresses', icon: <MapPin className="w-5 h-5" /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <User className="w-5 h-5" /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert("Failed to sign out: " + error.message);
        return;
      }
      navigate('/');
    } catch (err: any) {
      alert("Failed to sign out: " + err.message);
    }
  };

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <NavLink to="/" className="text-2xl font-serif font-bold text-accent">
          Ulacab
        </NavLink>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
