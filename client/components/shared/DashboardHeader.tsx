'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import ThemeToggle from './ThemeToggle';

export default function DashboardHeader() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-20 bg-base-100/80 backdrop-blur-sm border-b border-base-300 shadow-sm">
      <div className="flex justify-between items-center p-4 md:p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="btn btn-ghost btn-sm btn-circle hidden md:flex"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
