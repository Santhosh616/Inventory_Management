import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { 
  HomeIcon, 
  CubeIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  BellIcon 
} from '@heroicons/react/24/outline';

const Layout = () => {
  const [notifications, setNotifications] = useState([]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Inventory System</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="nav-link">
                  <HomeIcon className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/products" className="nav-link">
                  <CubeIcon className="h-5 w-5" />
                  <span>Products</span>
                </Link>
                <Link to="/suppliers" className="nav-link">
                  <UserGroupIcon className="h-5 w-5" />
                  <span>Suppliers</span>
                </Link>
                <Link to="/reports" className="nav-link">
                  <ChartBarIcon className="h-5 w-5" />
                  <span>Reports</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <BellIcon className="h-6 w-6 text-gray-500" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;