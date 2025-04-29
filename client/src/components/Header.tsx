import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  Menu, 
  Search, 
  Bell, 
  X,
  PenSquare,
  LogIn,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useAuth } from "@/hooks/use-auth";

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, isActive }) => {
  const activeClass = isActive 
    ? "border-primary-500 text-gray-900 dark:text-white" 
    : "border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200";
  
  return (
    <Link href={href}>
      <div className={`${activeClass} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer`}>
        {label}
      </div>
    </Link>
  );
};

const Header: React.FC = () => {
  const [location] = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logoutMutation } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm fixed w-full z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <svg className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 16L6 10H18L12 16Z" fill="currentColor"/>
                    <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">BlogAI</span>
                </div>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="/" label="Home" isActive={location === "/"} />
              <NavLink href="/explore" label="Explore" isActive={location === "/explore"} />
              {user && <NavLink href="/bookmarks" label="Bookmarks" isActive={location === "/bookmarks"} />}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Dark mode toggle */}
            <div className="mr-4 flex items-center">
              <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">Light</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
              </label>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Dark</span>
            </div>

            {user ? (
              <>
                {/* Create Blog Button */}
                <Link href="/editor">
                  <Button variant="ghost" size="sm" className="mr-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    <PenSquare className="h-5 w-5 mr-1" />
                    <span>Create</span>
                  </Button>
                </Link>
                
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                </Button>

                {/* User Profile */}
                <div className="ml-3 relative">
                  <Link href={`/profile/${user.id}`}>
                    <div className="cursor-pointer">
                      <Avatar>
                        <AvatarImage src={user.profileImage || undefined} alt={user.name || user.username} />
                        <AvatarFallback>{(user.name || user.username).substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </Link>
                </div>
                
                {/* Sign Out Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => logoutMutation.mutate()}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                {/* Create Blog Button (redirects to auth) */}
                <Link href="/auth/editor">
                  <Button variant="ghost" size="sm" className="mr-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    <PenSquare className="h-5 w-5 mr-1" />
                    <span>Create</span>
                  </Button>
                </Link>
                
                {/* Sign In Button */}
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="mr-2">
                    <LogIn className="h-5 w-5 mr-1" />
                    <span>Sign in</span>
                  </Button>
                </Link>
                
                {/* Sign Up Button */}
                <Link href="/auth?tab=register">
                  <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                    <UserPlus className="h-5 w-5 mr-1" />
                    <span>Sign up</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-2">
            <Link href="/">
              <div className="px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                Home
              </div>
            </Link>
            <Link href="/explore">
              <div className="px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                Explore
              </div>
            </Link>
            {user && (
              <Link href="/bookmarks">
                <div className="px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  Bookmarks
                </div>
              </Link>
            )}
          </div>

          {user ? (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar>
                    <AvatarImage src={user.profileImage || undefined} alt={user.name || user.username} />
                    <AvatarFallback>{(user.name || user.username).substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">{user.name || user.username}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-col space-y-1">
                <Link href={`/profile/${user.id}`}>
                  <div className="px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                    Your Profile
                  </div>
                </Link>
                <Link href="/editor">
                  <div className="px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                    Create Blog
                  </div>
                </Link>
                <button 
                  className="text-left px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => logoutMutation.mutate()}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-3">
              <Link href="/auth/editor">
                <div className="flex items-center px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                  <PenSquare className="h-5 w-5 mr-2" />
                  Create Blog
                </div>
              </Link>
              <Link href="/auth">
                <div className="w-full text-center px-4 py-2 text-base font-medium bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md">
                  Sign in
                </div>
              </Link>
              <Link href="/auth?tab=register">
                <div className="w-full text-center px-4 py-2 text-base font-medium bg-primary-500 text-white rounded-md">
                  Sign up
                </div>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
