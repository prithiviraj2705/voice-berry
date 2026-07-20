import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-serif font-bold text-accent">
          Ulacab
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#services" className="text-foreground hover:text-accent transition-colors">Services</a>
          <a href="#how-it-works" className="text-foreground hover:text-accent transition-colors">How It Works</a>
          <a href="#reviews" className="text-foreground hover:text-accent transition-colors">Reviews</a>
          <a href="#contact" className="text-foreground hover:text-accent transition-colors">Contact</a>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2 hover:text-accent transition-colors">
                <div className="w-8 h-8 rounded-full border-2 border-border overflow-hidden bg-muted">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email?.split('@')[0] || 'User'}`} alt="avatar" className="w-full h-full" />
                </div>
                <span className="font-medium text-sm hidden md:block">Dashboard</span>
              </Link>
              <Button onClick={() => signOut()} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
