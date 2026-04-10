import { Link } from 'react-router';
import { Linkedin, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] flex items-center justify-center">
                <span className="text-white font-bold text-lg">SG</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                SmartGodown
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('footer.built')}
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-[rgb(var(--accent-primary))]/10 transition-colors"
              >
                <Linkedin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-[rgb(var(--accent-primary))]/10 transition-colors"
              >
                <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-[rgb(var(--accent-primary))]">
                  About
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-gray-600 dark:text-gray-400 hover:text-[rgb(var(--accent-primary))]">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-[rgb(var(--accent-primary))]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-[rgb(var(--accent-primary))]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-[rgb(var(--accent-primary))]">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-[rgb(var(--accent-primary))]">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-[rgb(var(--accent-primary))]">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t dark:border-gray-800 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} SmartGodown. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
