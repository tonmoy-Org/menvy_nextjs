/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Search, TrendingUp, DollarSign, Calendar, Printer, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { printReceipt } from '@/components/Sales/ReceiptPrinter';

interface Sale {
  _id: string;
  billNo: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  sellerName: string;
  customer?: {
    name?: string;
    phone?: string;
  };
  paymentMethod: 'cash' | 'card' | 'mobile_banking';
  createdAt: string;
}

export default function AdminSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sellerFilter, setSellerFilter] = useState('all');

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    let filtered = sales.filter(sale =>
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customer?.name && sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(sale => 
            new Date(sale.createdAt).toDateString() === today.toDateString()
          );
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(sale => 
            new Date(sale.createdAt) >= filterDate
          );
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(sale => 
            new Date(sale.createdAt) >= filterDate
          );
          break;
      }
    }

    // Seller filter
    if (sellerFilter !== 'all') {
      filtered = filtered.filter(sale => sale.sellerName === sellerFilter);
    }

    setFilteredSales(filtered);
  }, [sales, searchTerm, dateFilter, sellerFilter]);

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sales', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSales(data.sales);
      } else {
        toast.error('Failed to fetch sales');
      }
    } catch (error) {
      toast.error('Error fetching sales');
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueSellers = Array.from(new Set(sales.map(sale => sale.sellerName)));
  const todaySales = sales.filter(sale => 
    new Date(sale.createdAt).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todaySales.reduce((acc, sale) => acc + sale.total, 0);
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const avgSaleValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
            <p className="text-gray-600 mt-2">Monitor and analyze all sales transactions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sales.length}</div>
              <p className="text-xs text-muted-foreground">All time transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{todaySales.length}</div>
              <p className="text-xs text-muted-foreground">৳{todayRevenue.toLocaleString()} revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">৳{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Sale Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">৳{avgSaleValue.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sellerFilter} onValueChange={setSellerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by seller" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sellers</SelectItem>
                  {uniqueSellers.map(seller => (
                    <SelectItem key={seller} value={seller}>{seller}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600 flex items-center">
                Showing {filteredSales.length} of {sales.length} sales
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Transactions</CardTitle>
            <CardDescription>
              Complete list of all sales transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Bill No</th>
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Seller</th>
                    <th className="text-left py-3 px-4 font-medium">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium">Total</th>
                    <th className="text-left py-3 px-4 font-medium">Payment</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{sale.billNo}</td>
                      <td className="py-3 px-4 font-medium">{sale.productName}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {sale.customer?.name || 'Walk-in Customer'}
                        {sale.customer?.phone && (
                          <div className="text-xs text-gray-500">{sale.customer.phone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">{sale.sellerName}</td>
                      <td className="py-3 px-4">{sale.quantity}</td>
                      <td className="py-3 px-4 font-semibold">৳{sale.total.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {sale.paymentMethod.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(sale.createdAt).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {new Date(sale.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => printReceipt(sale)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSales.length === 0 && (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
                <p className="text-gray-600">
                  {searchTerm || dateFilter !== 'all' || sellerFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'No sales have been recorded yet'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}