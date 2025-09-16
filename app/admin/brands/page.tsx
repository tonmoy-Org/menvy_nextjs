"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Plus, Edit, Trash2, Search, Building2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import BrandForm from '@/components/Brands/BrandForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface Brand {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    const filtered = brands.filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredBrands(filtered);
  }, [brands, searchTerm]);

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/brands', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands);
      } else {
        toast.error('Failed to fetch brands');
      }
    } catch (error) {
      toast.error('Error fetching brands');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (brand: Brand) => {
    setBrandToDelete(brand);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/brands/${brandToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Brand deleted successfully');
        fetchBrands();
      } else {
        toast.error('Failed to delete brand');
      }
    } catch (error) {
      toast.error('Error deleting brand');
    } finally {
      setDeleteConfirmOpen(false);
      setBrandToDelete(null);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  const handleBrandSaved = () => {
    fetchBrands();
    handleModalClose();
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
            <p className="text-gray-600 mt-2">Manage clothing brands for your Shop</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-sky-300 hover:bg-sky-400 text-black">
            <Plus className="w-5 h-5 mr-2" />
            Add Brand
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brands.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Brands</CardTitle>
              <Building2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {brands.filter(b => b.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Brands</CardTitle>
              <Building2 className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {brands.filter(b => !b.isActive).length}
              </div>
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
                placeholder="Search brands by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <Card key={brand._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{brand.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {brand.description || 'No description'}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(brand)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDelete(brand)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${brand.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {brand.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm">{new Date(brand.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBrands.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first brand'}
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Brand
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Brand Form Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </DialogTitle>
            </DialogHeader>
            <BrandForm
              brand={editingBrand}
              onSave={handleBrandSaved}
              onCancel={handleModalClose}
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
              <DialogTitle className="text-center text-xl">Delete Brand</DialogTitle>
              <DialogDescription className="text-center">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{brandToDelete?.name}</span>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="w-full">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="w-full">
                Delete Brand
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}