"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { 
  Users, 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  totalUsers: number;
  lowStockProducts: number;
  todaySales: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    todaySales: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch multiple endpoints
      const [productsRes, salesRes, usersRes] = await Promise.all([
        fetch('/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/sales', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
      ]);

      const [productsData, salesData, usersData] = await Promise.all([
        productsRes.json(),
        salesRes.json(),
        usersRes.json(),
      ]);

      const today = new Date().toDateString();
      const todaySales = salesData.sales?.filter((sale: any) => 
        new Date(sale.createdAt).toDateString() === today
      ).length || 0;

      const totalRevenue = salesData.sales?.reduce((acc: number, sale: any) => 
        acc + sale.total, 0
      ) || 0;

      const lowStockProducts = productsData.products?.filter((product: any) => 
        product.stock <= product.minStock
      ).length || 0;

      setStats({
        totalProducts: productsData.products?.length || 0,
        totalSales: salesData.sales?.length || 0,
        totalRevenue,
        totalUsers: usersData.users?.length || 0,
        lowStockProducts,
        todaySales,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-blue-500',
      description: 'Products in Shop',
    },
    {
      title: 'Total Sales',
      value: stats.totalSales.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-green-500',
      description: 'All time sales',
    },
    {
      title: 'Total Revenue',
      value: `৳${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      description: 'Total earnings',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-indigo-500',
      description: 'System users',
    },
    {
      title: "Today's Sales",
      value: stats.todaySales.toLocaleString(),
      icon: ShoppingCart,
      color: 'bg-orange-500',
      description: 'Sales made today',
    },
    {
      title: 'Low Stock Alert',
      value: stats.lowStockProducts.toLocaleString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
      description: 'Products need restock',
    },
  ];

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to Menvy Shop Management System</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <card.icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {card.value}
                  </div>
                  <CardDescription className="text-xs text-gray-500">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/admin/products"
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">Add New Product</div>
                <div className="text-sm text-gray-500">Add products to Shop</div>
              </a>
              <a
                href="/admin/users"
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">Manage Users</div>
                <div className="text-sm text-gray-500">Add or manage system users</div>
              </a>
              <a
                href="/admin/sales"
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">View Sales</div>
                <div className="text-sm text-gray-500">Monitor sales performance</div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>Current system status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low Stock Alerts</span>
                <span className={`text-sm font-medium ${
                  stats.lowStockProducts > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats.lowStockProducts}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}