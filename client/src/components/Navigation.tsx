import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BarChart3, 
  Settings,
  Menu,
  X,
  ArrowRight,
  BookOpen,
  GraduationCap,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Learn', href: '/session', icon: GraduationCap },
  { name: 'Progress', href: '/dashboard', icon: BarChart3 },
  { name: 'Library', href: '/library', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  // Handle navigation smoothly
  const handleNavigation = (path: string) => {
    try {
      if (typeof window !== 'undefined' && window.location.pathname !== path) {
        navigate(path);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = path;
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6">
      <nav 
        className={`max-w-5xl mx-auto px-4 sm:px-6 py-2 rounded-full transition-all duration-300 shadow-md ${
          isScrolled
            ? 'bg-gradient-to-r from-mentor-primary/95 to-mentor-secondary/95 backdrop-blur-md shadow-lg shadow-mentor-primary/20'
            : 'bg-gradient-to-r from-mentor-primary to-mentor-secondary'
        }`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 pl-1">
            <img 
              src="/mento.png" 
              alt="mento.ai" 
              className="h-7 sm:h-8 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Desktop Center Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-white font-semibold'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-white/25 rounded-full -z-10 shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30
                      }}
                    />
                  )}
                  <Icon size={16} className="flex-shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Right Auth Section */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0 pr-1">
            {isAuthenticated ? (
              <>
                <Button 
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-white/90 hover:shadow-md rounded-full px-4 py-1.5 text-xs lg:text-sm font-semibold shadow-sm transition-all h-8 flex items-center gap-1.5"
                  onClick={() => handleNavigation('/session')}
                >
                  <span>Start</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-full px-3.5 py-1.5 text-xs lg:text-sm font-medium transition-all h-8 flex items-center gap-1.5"
                  onClick={logout}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-full px-3.5 py-1.5 text-xs lg:text-sm font-medium transition-all h-8"
                  onClick={() => handleNavigation('/login')}
                >
                  Log in
                </Button>
                <Button 
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-white/90 hover:shadow-md rounded-full px-4 py-1.5 text-xs lg:text-sm font-semibold shadow-sm transition-all h-8"
                  onClick={() => handleNavigation('/signup')}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-1.5 rounded-full text-white hover:bg-white/20 focus:outline-none transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="md:hidden mt-3 pt-3 border-t border-white/20 space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      handleNavigation(item.href);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active 
                        ? 'bg-white/25 text-white font-semibold' 
                        : 'text-white/80 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
              
              <div className="pt-3 mt-2 border-t border-white/15 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Button 
                      className="w-full bg-white text-gray-900 hover:bg-white/90 rounded-xl py-2 font-semibold flex items-center justify-center gap-2"
                      onClick={() => {
                        handleNavigation('/session');
                        setIsOpen(false);
                      }}
                    >
                      <span>Start Learning</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-full text-white hover:bg-white/15 rounded-xl py-2 flex items-center justify-center gap-2"
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="ghost"
                      className="w-full text-white hover:bg-white/15 rounded-xl py-2 font-medium"
                      onClick={() => {
                        handleNavigation('/login');
                        setIsOpen(false);
                      }}
                    >
                      Log in
                    </Button>
                    <Button 
                      className="w-full bg-white text-gray-900 hover:bg-white/90 rounded-xl py-2 font-semibold"
                      onClick={() => {
                        handleNavigation('/signup');
                        setIsOpen(false);
                      }}
                    >
                      Sign up
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}