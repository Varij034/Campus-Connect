'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  GraduationCap, 
  Building2, 
  MessageSquare, 
  User, 
  LogOut,
  LayoutDashboard,
  Briefcase,
  FileEdit,
  Users,
  ClipboardList
} from 'lucide-react';

interface MobileNavProps {
  role: 'student' | 'hr';
}

export default function MobileNav({ role }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/applications', label: 'Applications', icon: ClipboardList },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const hrLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/postings', label: 'Postings', icon: FileEdit },
    { href: '/candidates', label: 'Candidates', icon: Users },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const links = role === 'student' ? studentLinks : hrLinks;

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-circle fixed top-4 left-4 z-50 bg-base-100 shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <nav className="fixed top-0 left-0 w-64 h-full bg-base-200 shadow-xl z-50 p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-8">
              <GraduationCap className="w-8 h-8 text-primary" />
              <h2 className="text-xl font-bold text-base-content">Campus Connect</h2>
            </div>
            <ul className="space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === `/${role === 'student' ? 'student' : 'hr'}${link.href}`;
                return (
                  <li key={link.href}>
                    <Link
                      href={`/${role === 'student' ? 'student' : 'hr'}${link.href}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-content'
                          : 'text-base-content hover:bg-base-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8">
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-base-content hover:bg-base-300 w-full transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
