import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen max-w-lg mx-auto relative app-bg">
      <main className="pb-24">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
