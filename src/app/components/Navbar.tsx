import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showAccentMenu, setShowAccentMenu] = useState(false);
  const { mode, toggleMode, accentColor, setAccentColor } = useTheme();
  const { t, language, setLanguage } = useLanguage();
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
    { path: '/', label: t('nav.home') },
    ...(isLoggedIn ? [{ path: '/dashboard', label: t('nav.dashboard') }] : []),
    { path: '/features', label: t('nav.features') },
    { path: '/pricing', label: t('nav.pricing') },
    { path: '/how-it-works', label: t('nav.howItWorks') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const accentColors = [
    { name: 'blue', color: 'bg-blue-500' },
    { name: 'green', color: 'bg-green-500' },
    { name: 'purple', color: 'bg-purple-500' },
    { name: 'orange', color: 'bg-orange-500' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] flex items-center justify-center">
              <span className="text-white font-bold text-lg">SI</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
              Smart Inventory
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${location.pathname === link.path
                  ? 'text-[rgb(var(--accent-primary))]'
                  : 'text-gray-700 dark:text-gray-300 hover:text-[rgb(var(--accent-primary))]'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="relative flex items-center gap-1">
              <button
                onClick={() => {
                  const langs = ['en', 'hi', 'mr'];
                  const currentIndex = langs.indexOf(language);
                  const nextIndex = (currentIndex + 1) % langs.length;
                  setLanguage(langs[nextIndex] as any);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 group"
                title="Change Language"
              >
                <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase w-5 text-center transition-all">
                  {language}
                </span>
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mode === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700" />
              ) : (
                <Sun className="w-5 h-5 text-gray-300" />
              )}
            </button>

            {/* Accent Color Picker */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowAccentMenu(!showAccentMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className={`w-5 h-5 rounded-full ${accentColors.find(c => c.name === accentColor)?.color}`} />
              </button>
              <AnimatePresence>
                {showAccentMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3"
                  >
                    <div className="grid grid-cols-4 gap-2">
                      {accentColors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => {
                            setAccentColor(color.name as any);
                            setShowAccentMenu(false);
                          }}
                          className={`w-8 h-8 rounded-full ${color.color} ${accentColor === color.name ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white' : ''
                            }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {isLoggedIn ? (
                <>
                  <Button variant="ghost" onClick={() => { logout(); navigate('/'); }}>
                    Logout
                  </Button>
                  <Button onClick={() => navigate('/dashboard')} className="bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90 text-white">
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    {t('nav.login') || 'Login'}
                  </Button>
                  <Button onClick={() => navigate('/login')} className="bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90 text-white">
                    {t('nav.startTrial')}
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
                      {t('nav.login') || 'Login'}
                    </Button>
                    <Button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} className="w-full bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90 text-white">
                      {t('nav.startTrial')}
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
