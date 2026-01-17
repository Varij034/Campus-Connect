import Navbar from '@/components/shared/Navbar';
import MobileNav from '@/components/shared/MobileNav';
import DashboardHeader from '@/components/shared/DashboardHeader';
import { SidebarProvider } from '@/contexts/SidebarContext';
import SidebarLayout from '@/components/shared/SidebarLayout';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
        <MobileNav role="student" />
        <Navbar role="student" />
        <SidebarLayout>
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </SidebarLayout>
      </div>
    </SidebarProvider>
  );
}
