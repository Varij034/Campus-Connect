'use client';

import { useSidebar } from '@/contexts/SidebarContext';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <motion.div 
      className="flex-1 flex flex-col w-full"
      animate={{
        marginLeft: isCollapsed ? '80px' : '256px'
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}
