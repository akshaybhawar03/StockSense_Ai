import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/features', label: 'Features' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/80 backdrop-blur-lg shadow-lg'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logos/main-logo.jpeg" alt="SmartGodown Logo" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <span className="font-bold text-[22px] text-[#0f172a] dark:text-white hidden sm:block tracking-tight">
              SmartGodown
            </span>
          </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[15px] font-semibold transition-colors ${location.pathname === link.path
                    ? 'text-[#22C55E]'
                    : 'text-[#475569] dark:text-gray-300 hover:text-[#22C55E]'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-6 ml-2">
              {isLoggedIn ? (
                <>
                  <Button variant="ghost" onClick={() => { logout(); navigate('/'); }} className="text-gray-700 dark:text-gray-300 font-semibold text-[15px]">
                    Logout
                  </Button>
                  <Button onClick={() => navigate('/dashboard')} className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white font-semibold text-[15px] rounded-[8px] px-6 py-5">
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className="text-[#0f172a] dark:text-white font-semibold text-[15px] hover:text-[#22C55E] bg-transparent">
                    Login
                  </button>
                  <Button onClick={() => navigate('/register')} className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white font-semibold text-[15px] px-6 rounded-[8px] py-5">
                    Start Free Trial
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg ${location.pathname === link.path
                    ? 'bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                {isLoggedIn ? (
                  <>
                    <Button variant="outline" className="w-full" onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); }}>
                      Logout
                    </Button>
                    <Button onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard'); }} className="w-full bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90 text-white">
                      Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}>
                      {/* {t('nav.login') || 'Login'} */}
                      Login
                    </Button>
                    <Button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} className="w-full bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90 text-white">
                      {/* {t('nav.startTrial')} */}
                      Start Free Trial
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
