import { Outlet } from 'react-router';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Toaster } from './components/ui/sonner';

export function Layout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <Toaster />
    </div>
  );
}
