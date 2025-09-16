"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  category: { _id: string; name: string };
  brand: { _id: string; name: string };
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  sku: string;
  size?: string;
  color?: string;
}

interface ProductFormProps {
  product?: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '5',
    sku: '',
    size: '',
    color: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category._id,
        brand: product.brand._id,
        price: product.price.toString(),
        costPrice: product.costPrice.toString(),
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        sku: product.sku,
        size: product.size || '',
        color: product.color || '',
      });
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/brands', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MV${timestamp}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = product ? `/api/products/${product._id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        sku: formData.sku || generateSKU(),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(`Product ${product ? 'updated' : 'created'} successfully`);
        onSave();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save product');
      }
    } catch (error) {
      toast.error('Error saving product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="Auto-generated if empty"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Brand *</Label>
          <Select value={formData.brand} onValueChange={(value) => handleChange('brand', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand._id} value={brand._id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Selling Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price *</Label>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            value={formData.costPrice}
            onChange={(e) => handleChange('costPrice', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => handleChange('stock', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minStock">Minimum Stock</Label>
          <Input
            id="minStock"
            type="number"
            value={formData.minStock}
            onChange={(e) => handleChange('minStock', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            value={formData.size}
            onChange={(e) => handleChange('size', e.target.value)}
            placeholder="e.g., S, M, L, XL"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
            placeholder="e.g., Red, Blue, Black"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}