
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="py-6 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          TimeFlow &copy; {new Date().getFullYear()} - Manage your time with purpose
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
