/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Plus, Search, Printer, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import SaleForm from '@/components/Sales/SaleForm';
import { printReceipt } from '@/components/Sales/ReceiptPrinter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

export default function SellerSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    const filtered = sales.filter(sale =>
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customer?.name && sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSales(filtered);
  }, [sales, searchTerm]);

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

  const handleSaleComplete = () => {
    fetchSales();
    setIsModalOpen(false);
  };

  const todaySales = sales.filter(sale =>
    new Date(sale.createdAt).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todaySales.reduce((acc, sale) => acc + sale.total, 0);
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="seller">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="seller">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
            <p className="text-gray-600 mt-2">Record and manage your sales transactions</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-sky-300 hover:bg-sky-400 text-black">
            <Plus className="w-5 h-5 mr-2" />
            New Sale
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaySales.length}</div>
              <p className="text-xs text-muted-foreground">transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{todayRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">earned today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sales.length}</div>
              <p className="text-xs text-muted-foreground">all time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">all time</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search sales by product, bill number, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>
              Showing {filteredSales.length} of {sales.length} sales
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
                      </td>
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
                <div className="w-12 h-12 text-gray-400 mx-auto mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Start by recording your first sale'
                  }
                </p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Sale
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sale Form Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
            </DialogHeader>
            <SaleForm
              onSave={handleSaleComplete}
              onCancel={() => setIsModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}