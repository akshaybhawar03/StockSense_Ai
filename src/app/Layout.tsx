import { Outlet, useLocation } from 'react-router';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Toaster } from './components/ui/sonner';

export function Layout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {!isAuthPage && <Navbar />}
      <main>
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <WhatsAppButton />}
      <Toaster />
    </div>
  );
}
