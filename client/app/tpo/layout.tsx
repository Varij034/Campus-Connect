import Navbar from '@/components/shared/Navbar';
import MobileNav from '@/components/shared/MobileNav';
import DashboardHeader from '@/components/shared/DashboardHeader';
import { SidebarProvider } from '@/contexts/SidebarContext';
import SidebarLayout from '@/components/shared/SidebarLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function TPOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="tpo">
      <SidebarProvider>
        <div className="flex min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
          <MobileNav role="tpo" />
          <Navbar role="tpo" />
          <SidebarLayout>
            <DashboardHeader />
            <main className="flex-1 p-4 md:p-8">
              {children}
            </main>
          </SidebarLayout>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
