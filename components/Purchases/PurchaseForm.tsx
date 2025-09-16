"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  sku: string;
  costPrice: number;
}

interface PurchaseFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export default function PurchaseForm({ onSave, onCancel }: PurchaseFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '1',
    costPrice: '',
    supplierName: '',
    supplierPhone: '',
    supplierAddress: '',
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (formData.productId) {
      const product = products.find(p => p._id === formData.productId);
      setSelectedProduct(product || null);
      if (product && !formData.costPrice) {
        setFormData(prev => ({ ...prev, costPrice: product.costPrice.toString() }));
      }
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, products]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    const quantity = parseInt(formData.quantity || '0');
    const costPrice = parseFloat(formData.costPrice || '0');
    return quantity * costPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    if (!formData.supplierName.trim()) {
      toast.error('Please enter supplier name');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: formData.productId,
          quantity: parseInt(formData.quantity),
          costPrice: parseFloat(formData.costPrice),
          supplierName: formData.supplierName,
          supplierPhone: formData.supplierPhone || undefined,
          supplierAddress: formData.supplierAddress || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Purchase recorded successfully!');
        onSave();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to record purchase');
      }
    } catch (error) {
      toast.error('Error recording purchase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product">Product *</Label>
          <Select value={formData.productId} onValueChange={(value) => handleChange('productId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product._id} value={product._id}>
                  {product.name} ({product.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price (per unit) *</Label>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.costPrice}
            onChange={(e) => handleChange('costPrice', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierName">Supplier Name *</Label>
          <Input
            id="supplierName"
            value={formData.supplierName}
            onChange={(e) => handleChange('supplierName', e.target.value)}
            required
            placeholder="Enter supplier name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierPhone">Supplier Phone</Label>
          <Input
            id="supplierPhone"
            value={formData.supplierPhone}
            onChange={(e) => handleChange('supplierPhone', e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplierAddress">Supplier Address</Label>
        <Textarea
          id="supplierAddress"
          value={formData.supplierAddress}
          onChange={(e) => handleChange('supplierAddress', e.target.value)}
          rows={2}
          placeholder="Optional"
        />
      </div>

      {/* Purchase Summary */}
      {selectedProduct && formData.costPrice && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Purchase Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Product:</span>
              <span>{selectedProduct.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Cost Price:</span>
              <span>৳{parseFloat(formData.costPrice).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span>{formData.quantity}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-1">
              <span>Total Cost:</span>
              <span>৳{calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !selectedProduct}>
          {isLoading ? 'Recording...' : 'Record Purchase'}
        </Button>
      </div>
    </form>
  );
}