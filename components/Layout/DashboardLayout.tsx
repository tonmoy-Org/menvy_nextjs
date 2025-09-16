"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'seller';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  requiredRole
}) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);

      if (requiredRole && parsedUser.role !== requiredRole) {
        router.push('/login');
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      router.push('/login');
      return;
    } finally {
      setIsLoading(false);
    }
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        <div className="w-64 fixed inset-y-0 left-0 z-50">
          <Sidebar userRole={user.role} userName={user.name} />
        </div>
        <div className="ml-64 flex-1 flex flex-col min-h-screen">
          <main className="p-6 flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;