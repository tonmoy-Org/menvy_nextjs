"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SellerStats {
  totalProducts: number;
  mySales: number;
  myRevenue: number;
  todaySales: number;
  thisWeekSales: number;
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    mySales: 0,
    myRevenue: 0,
    todaySales: 0,
    thisWeekSales: 0,
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [productsRes, salesRes] = await Promise.all([
        fetch('/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/sales', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
      ]);

      const [productsData, salesData] = await Promise.all([
        productsRes.json(),
        salesRes.json(),
      ]);

      const today = new Date();
      const todayStr = today.toDateString();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const todaySales = salesData.sales?.filter((sale: any) => 
        new Date(sale.createdAt).toDateString() === todayStr
      ).length || 0;

      const thisWeekSales = salesData.sales?.filter((sale: any) => 
        new Date(sale.createdAt) >= weekAgo
      ).length || 0;

      const myRevenue = salesData.sales?.reduce((acc: number, sale: any) => 
        acc + sale.total, 0
      ) || 0;

      setStats({
        totalProducts: productsData.products?.length || 0,
        mySales: salesData.sales?.length || 0,
        myRevenue,
        todaySales,
        thisWeekSales,
      });

      setRecentSales(salesData.sales?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Available Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-blue-500',
      description: 'Products in Shop',
    },
    {
      title: 'My Sales',
      value: stats.mySales.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-green-500',
      description: 'Total sales made',
    },
    {
      title: 'My Revenue',
      value: `৳${stats.myRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      description: 'Total earnings',
    },
    {
      title: "Today's Sales",
      value: stats.todaySales.toLocaleString(),
      icon: ShoppingCart,
      color: 'bg-orange-500',
      description: 'Sales made today',
    },
  ];

  return (
    <DashboardLayout requiredRole="seller">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your sales performance and manage Shop</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <CardDescription>Common seller tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/seller/sales"
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">Record New Sale</div>
                <div className="text-sm text-gray-500">Process customer purchases</div>
              </a>
              <a
                href="/seller/products"
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">View Products</div>
                <div className="text-sm text-gray-500">Browse available Shop</div>
              </a>
              <a
                href="/seller/profile"
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">Update Profile</div>
                <div className="text-sm text-gray-500">Manage your account settings</div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSales.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No sales recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {recentSales.map((sale, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <div className="font-medium text-sm">{sale.productName}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">৳{sale.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Qty: {sale.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Your sales performance this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">This Week's Sales</div>
                  <div className="text-sm text-gray-500">{stats.thisWeekSales} transactions</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {((stats.todaySales / (stats.thisWeekSales || 1)) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Today's contribution</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}