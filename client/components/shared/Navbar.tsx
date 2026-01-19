'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Building2, 
  MessageSquare, 
  User, 
  LogOut,
  LayoutDashboard,
  Briefcase,
  FileText,
  FileEdit,
  Users,
  ClipboardList
} from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  role: 'student' | 'hr';
}

export default function Navbar({ role }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };
  
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
    <motion.nav
      initial={{ x: -100, opacity: 0 }}
      animate={{ 
        x: 0, 
        opacity: 1,
        width: isCollapsed ? '80px' : '256px'
      }}
      transition={{ duration: 0.3 }}
      className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-base-200 shadow-lg z-10 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} mb-8 p-4`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h2 className="text-xl font-bold text-base-content whitespace-nowrap">Campus Connect</h2>
          </div>
        )}
        {isCollapsed && (
          <GraduationCap className="w-8 h-8 text-primary" />
        )}
      </div>

      <ul className="space-y-2 px-2">
        {links.map((link, index) => {
          const Icon = link.icon;
          const isActive = pathname === `/${role === 'student' ? 'student' : 'hr'}${link.href}`;
          
          return (
            <motion.li
              key={link.href}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/${role === 'student' ? 'student' : 'hr'}${link.href}`}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'
                } py-3 rounded-xl transition-colors group relative ${
                  isActive
                    ? 'bg-primary text-primary-content'
                    : 'text-base-content hover:bg-base-300'
                }`}
                title={isCollapsed ? link.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="whitespace-nowrap">{link.label}</span>
                )}
                {isCollapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-base-300 text-base-content text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {link.label}
                  </span>
                )}
              </Link>
            </motion.li>
          );
        })}
      </ul>

      <div className="mt-auto pt-8 px-2">
        <button 
          onClick={handleLogout}
          className={`flex items-center ${
            isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'
          } py-3 rounded-lg text-base-content hover:bg-base-300 w-full transition-colors`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.nav>
  );
}
