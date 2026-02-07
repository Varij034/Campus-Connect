'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'hr' | 'admin' | 'tpo';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      if (requiredRole) {
        // Map client roles to backend roles
        const roleMap: Record<string, UserRole> = {
          'student': UserRole.STUDENT,
          'hr': UserRole.RECRUITER,
          'admin': UserRole.ADMIN,
          'tpo': UserRole.TPO,
        };

        const requiredBackendRole = roleMap[requiredRole];
        if (user && user.role !== requiredBackendRole) {
          // Redirect to appropriate dashboard based on user role
          if (user.role === UserRole.STUDENT) {
            router.push('/student/dashboard');
          } else if (user.role === UserRole.RECRUITER) {
            router.push('/hr/dashboard');
          } else if (user.role === UserRole.TPO) {
            router.push('/tpo/dashboard');
          } else {
            router.push('/auth/login');
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole) {
    const roleMap: Record<string, UserRole> = {
      'student': UserRole.STUDENT,
      'hr': UserRole.RECRUITER,
      'admin': UserRole.ADMIN,
      'tpo': UserRole.TPO,
    };

    const requiredBackendRole = roleMap[requiredRole];
    if (user && user.role !== requiredBackendRole) {
      return null;
    }
  }

  return <>{children}</>;
}
