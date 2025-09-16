/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Plus, Search, Trash2, ShoppingCart, TrendingUp, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import PurchaseForm from '@/components/Purchases/PurchaseForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface Purchase {
  _id: string;
  purchaseNo: string;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
  supplier: {
    name: string;
    phone?: string;
    address?: string;
  };
  createdByName: string;
  createdAt: string;
}

export default function AdminPurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    const filtered = purchases.filter(purchase =>
      purchase.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.purchaseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.createdByName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPurchases(filtered);
  }, [purchases, searchTerm]);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/purchases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPurchases(data.purchases);
      } else {
        toast.error('Failed to fetch purchases');
      }
    } catch (error) {
      toast.error('Error fetching purchases');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (purchase: Purchase) => {
    setPurchaseToDelete(purchase);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!purchaseToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/purchases/${purchaseToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Purchase deleted successfully');
        fetchPurchases();
      } else {
        toast.error('Failed to delete purchase');
      }
    } catch (error) {
      toast.error('Error deleting purchase');
    } finally {
      setDeleteConfirmOpen(false);
      setPurchaseToDelete(null);
    }
  };

  const handlePurchaseComplete = () => {
    fetchPurchases();
    setIsModalOpen(false);
  };

  const totalPurchases = purchases.length;
  const totalAmount = purchases.reduce((acc, purchase) => acc + purchase.total, 0);
  const todayPurchases = purchases.filter(purchase =>
    new Date(purchase.createdAt).toDateString() === new Date().toDateString()
  );
  const todayAmount = todayPurchases.reduce((acc, purchase) => acc + purchase.total, 0);

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
            <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
            <p className="text-gray-600 mt-2">Manage Shop purchases and supplier records</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-sky-300 hover:bg-sky-400 text-black">
            <Plus className="w-5 h-5 mr-2" />
            Record Purchase
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPurchases}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">৳{totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total spent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Purchases</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{todayPurchases.length}</div>
              <p className="text-xs text-muted-foreground">Purchases today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Amount</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">৳{todayAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Spent today</p>
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
                placeholder="Search purchases by product, purchase number, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Records</CardTitle>
            <CardDescription>
              Showing {filteredPurchases.length} of {purchases.length} purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Purchase No</th>
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-left py-3 px-4 font-medium">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium">Cost Price</th>
                    <th className="text-left py-3 px-4 font-medium">Total</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{purchase.purchaseNo}</td>
                      <td className="py-3 px-4 font-medium">{purchase.productName}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{purchase.supplier.name}</div>
                          {purchase.supplier.phone && (
                            <div className="text-xs text-gray-500">{purchase.supplier.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{purchase.quantity}</td>
                      <td className="py-3 px-4">৳{purchase.costPrice.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold">৳{purchase.total.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {new Date(purchase.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(purchase)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPurchases.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Start by recording your first purchase'
                  }
                </p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Purchase
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase Form Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record New Purchase</DialogTitle>
            </DialogHeader>
            <PurchaseForm
              onSave={handlePurchaseComplete}
              onCancel={() => setIsModalOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-center text-xl">Delete Purchase</DialogTitle>
              <DialogDescription className="text-center">
                Are you sure you want to delete purchase{' '}
                <span className="font-semibold">{purchaseToDelete?.purchaseNo}</span>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="w-full">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="w-full">
                Delete Purchase
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}