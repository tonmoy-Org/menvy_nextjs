"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Tag,
  Building2,
  LogOut,
  ShoppingBag,
  User,
  Settings
} from 'lucide-react';
import { toast } from 'react-toastify';
import logo from '@/public/logo.png';
import Image from 'next/image';

interface SidebarProps {
  userRole: 'admin' | 'seller';
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, userName }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const adminMenuItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/categories', icon: Tag, label: 'Categories' },
    { href: '/admin/brands', icon: Building2, label: 'Brands' },
    { href: '/admin/sales', icon: TrendingUp, label: 'Sales' },
    { href: '/admin/purchases', icon: ShoppingCart, label: 'Purchases' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/profile', icon: User, label: 'Profile' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const sellerMenuItems = [
    { href: '/seller/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/seller/products', icon: Package, label: 'Products' },
    { href: '/seller/sales', icon: TrendingUp, label: 'Sales' },
    { href: '/seller/profile', icon: User, label: 'Profile' },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : sellerMenuItems;

  return (
    <div className="bg-white shadow-lg h-full flex flex-col">
      {/* Enhanced Logo Section */}
      <div className="p-2 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-40 h-16 mb-2 flex items-center justify-center">
            <Image 
              src={logo} 
              alt="Menvy Logo" 
              className="object-contain w-full h-full"
              priority
            />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-sky-300 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${userRole === 'admin' ? 'bg-green-500' : 'bg-green-500'}`}></div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs capitalize text-red-600">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pt-1">
            Main Navigation
          </p>
        </div>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-sky-700 border-l-4 border-red-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {/* {isActive && (
                    <div className="ml-auto w-2 h-2 bg-sky-300 rounded-full"></div>
                  )} */}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-3 px-3 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200 border border-gray-200 hover:border-red-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;