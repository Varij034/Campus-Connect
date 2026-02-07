'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  FileText,
  Users,
  ClipboardList,
  Sparkles,
  Brain,
  UserPlus,
  Calendar,
  Mail
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MobileNavProps {
  role: 'student' | 'hr' | 'tpo';
}

export default function MobileNav({ role }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/auth/login');
  };

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/prep', label: 'Prep', icon: FileText },
    { href: '/aptitude', label: 'Aptitude', icon: Brain },
    { href: '/mentors', label: 'Mentors', icon: UserPlus },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/applications', label: 'Applications', icon: ClipboardList },
    { href: '/messages', label: 'Messages', icon: Mail },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const hrLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/postings', label: 'Postings', icon: FileEdit },
    { href: '/candidates', label: 'Candidates', icon: Users },
    { href: '/jd-matchmaker', label: 'JD Matchmaker', icon: Sparkles },
    { href: '/messages', label: 'Messages', icon: Mail },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const tpoLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const links = role === 'student' ? studentLinks : role === 'tpo' ? tpoLinks : hrLinks;
  const prefix = role === 'student' ? 'student' : role === 'tpo' ? 'tpo' : 'hr';

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
                const isActive = pathname === `/${prefix}${link.href}`;
                return (
                  <li key={link.href}>
                    <Link
                      href={`/${prefix}${link.href}`}
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
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base-content hover:bg-base-300 w-full transition-colors"
              >
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
