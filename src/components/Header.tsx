
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Clock, BarChart3, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Header: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };
  
  const links = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: <Home className="h-5 w-5" /> 
    },
    { 
      name: 'Sessions', 
      path: '/sessions', 
      icon: <Clock className="h-5 w-5" /> 
    },
    { 
      name: 'Statistics', 
      path: '/statistics', 
      icon: <BarChart3 className="h-5 w-5" /> 
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: <Settings className="h-5 w-5" /> 
    },
  ];
  
  const NavItems = () => (
    <>
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg transition-colors",
            isActiveRoute(link.path)
              ? "bg-primary text-primary-foreground"
              : "hover:bg-secondary text-foreground"
          )}
          onClick={() => isMobile && setMobileMenuOpen(false)}
        >
          {link.icon}
          <span className="ml-2">{link.name}</span>
        </Link>
      ))}
    </>
  );
  
  return (
    <header className="glass sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-timeflow-green-500 rounded-lg mr-2 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">TimeFlow</span>
          </Link>
        </div>
        
        {isMobile ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
            
            {mobileMenuOpen && (
              <div className="fixed inset-0 top-16 bg-background z-40 animate-fade-in">
                <nav className="container mx-auto p-4 flex flex-col space-y-2">
                  <NavItems />
                </nav>
              </div>
            )}
          </>
        ) : (
          <nav className="flex items-center space-x-1">
            <NavItems />
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
