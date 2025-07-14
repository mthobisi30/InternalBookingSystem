import { Link, useLocation } from "wouter";
import { Building, Calendar, LayoutDashboard, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onCreateBooking: () => void;
}

export function Header({ onCreateBooking }: HeaderProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Resource Booking</h1>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link href="/">
                <a
                  className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    isActive("/")
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </a>
              </Link>
              <Link href="/resources">
                <a
                  className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    isActive("/resources")
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
                  }`}
                >
                  <Building className="w-4 h-4 mr-2" />
                  Resources
                </a>
              </Link>
              <Link href="/bookings">
                <a
                  className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    isActive("/bookings")
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Bookings
                </a>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={onCreateBooking} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-700 hidden md:block">John Smith</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
